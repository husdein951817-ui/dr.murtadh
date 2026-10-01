import { Patient, ClinicSettings, SyncPayload } from '../types';
import { DEFAULT_SETTINGS, INITIAL_PATIENTS } from '../data/initialData';

const PATIENTS_STORAGE_KEY = 'iclinic_patients_v1';
const SETTINGS_STORAGE_KEY = 'iclinic_settings_v1';
const DEVICE_ID_KEY = 'iclinic_device_id';

// Generate or retrieve unique device ID
export const getDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

// BroadcastChannel for instant multi-tab sync on same machine
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('iclinic_realtime_sync');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported:', e);
}

// Local storage helpers
export const getLocalPatients = (): Patient[] => {
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse local patients', e);
  }
  return INITIAL_PATIENTS;
};

export const setLocalPatients = (patients: Patient[]) => {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error('Failed to save local patients', e);
  }
};

export const getLocalSettings = (): ClinicSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-update if previous placeholder/old name was present
      if (!parsed.clinicName || parsed.clinicName === 'عيادة الشفاء التخصصية') {
        parsed.clinicName = DEFAULT_SETTINGS.clinicName;
        parsed.doctorName = DEFAULT_SETTINGS.doctorName;
        parsed.clinicSpecialty = DEFAULT_SETTINGS.clinicSpecialty;
      }
      if (!parsed.defaultFee) {
        parsed.defaultFee = DEFAULT_SETTINGS.defaultFee;
      }
      if (!parsed.currency || parsed.currency === 'ر.س') {
        parsed.currency = DEFAULT_SETTINGS.currency;
      }
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse local settings', e);
  }
  return DEFAULT_SETTINGS;
};

export const setLocalSettings = (settings: ClinicSettings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save local settings', e);
  }
};

// Real-time Service Manager
type Listener = (payload: SyncPayload) => void;

class RealtimeSyncService {
  private listeners: Set<Listener> = new Set();
  private eventSource: EventSource | null = null;
  private isConnected: boolean = false;
  private connectionChangeListeners: Set<(connected: boolean, devicesCount: number) => void> = new Set();
  private deviceCount: number = 1;

  constructor() {
    this.setupBroadcastChannel();
    this.initServerEvents();
  }

  private setupBroadcastChannel() {
    if (!broadcastChannel) return;
    broadcastChannel.onmessage = (event) => {
      const payload: SyncPayload = event.data;
      if (payload && payload.sourceId !== getDeviceId()) {
        this.notifyListeners(payload);
      }
    };
  }

  private initServerEvents() {
    if (typeof window === 'undefined') return;

    try {
      this.eventSource = new EventSource('/api/sync/events');

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.notifyConnectionState(true, this.deviceCount);
      };

      this.eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === 'CONNECTED') {
            this.isConnected = true;
            this.deviceCount = parsed.clientsCount || 1;
            this.notifyConnectionState(true, this.deviceCount);
            return;
          }

          if (parsed.sourceId !== getDeviceId()) {
            this.notifyListeners({
              type: parsed.event as any,
              data: parsed.data,
              timestamp: parsed.timestamp,
              sourceId: parsed.sourceId,
            });
          }
        } catch {
          // ignore keepalive comments
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.notifyConnectionState(false, 1);
        // EventSource automatically retries connection
      };
    } catch {
      this.isConnected = false;
    }
  }

  public onSync(callback: Listener) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public onConnectionChange(callback: (connected: boolean, count: number) => void) {
    this.connectionChangeListeners.add(callback);
    callback(this.isConnected, this.deviceCount);
    return () => this.connectionChangeListeners.delete(callback);
  }

  private notifyListeners(payload: SyncPayload) {
    this.listeners.forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        console.error('Error in sync listener', err);
      }
    });
  }

  private notifyConnectionState(connected: boolean, count: number) {
    this.connectionChangeListeners.forEach((fn) => fn(connected, count));
  }

  public broadcastLocally(type: SyncPayload['type'], data: any) {
    const payload: SyncPayload = {
      type,
      data,
      timestamp: Date.now(),
      sourceId: getDeviceId(),
    };

    // Broadcast across tabs
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(payload);
      } catch {
        // ignore
      }
    }

    return payload;
  }

  // Network API with graceful offline fallback
  public async syncPatientCreation(patient: Patient): Promise<void> {
    this.broadcastLocally('PATIENT_CREATED', patient);
    try {
      await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient, sourceId: getDeviceId() }),
      });
    } catch {
      // Local storage already has it
    }
  }

  public async syncPatientUpdate(patient: Patient): Promise<void> {
    this.broadcastLocally('PATIENT_UPDATED', patient);
    try {
      await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient, sourceId: getDeviceId() }),
      });
    } catch {
      // Fallback local
    }
  }

  public async syncPatientDeletion(patientId: string): Promise<void> {
    this.broadcastLocally('PATIENT_DELETED', { id: patientId });
    try {
      await fetch(`/api/patients/${patientId}?sourceId=${getDeviceId()}`, {
        method: 'DELETE',
      });
    } catch {
      // Fallback local
    }
  }

  public async syncSettingsUpdate(settings: ClinicSettings): Promise<void> {
    this.broadcastLocally('SETTINGS_UPDATED', settings);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, sourceId: getDeviceId() }),
      });
    } catch {
      // Fallback local
    }
  }

  // Initial pull from server if available
  public async pullServerData(): Promise<{ patients?: Patient[]; settings?: ClinicSettings } | null> {
    try {
      const res = await fetch('/api/data', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // offline or server not responding yet
    }
    return null;
  }
}

export const syncService = new RealtimeSyncService();
