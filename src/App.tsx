import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { DailyReceptionView } from './components/DailyReceptionView';
import { MonthlyArchiveView } from './components/MonthlyArchiveView';
import { FollowUpAlertsView } from './components/FollowUpAlertsView';
import { SettingsView } from './components/SettingsView';
import { PatientRegistrationModal } from './components/PatientRegistrationModal';
import { PrintInvoiceModal } from './components/PrintInvoiceModal';
import { Patient, ClinicSettings, PatientStatus, SyncPayload } from './types';
import { 
  getLocalPatients, 
  setLocalPatients, 
  getLocalSettings, 
  setLocalSettings, 
  syncService 
} from './services/syncService';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(() => getLocalPatients());
  const [settings, setSettings] = useState<ClinicSettings>(() => getLocalSettings());
  const [activeTab, setActiveTab] = useState<NavTab>('reception');

  // Modals state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isPrintInvoiceOpen, setIsPrintInvoiceOpen] = useState(false);
  const [printingPatient, setPrintingPatient] = useState<Patient | null>(null);

  // Sync state
  const [isSyncConnected, setIsSyncConnected] = useState(false);
  const [connectedDevicesCount, setConnectedDevicesCount] = useState(1);

  // Sync dark mode class to document element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Initial pull from server and setup real-time listeners
  useEffect(() => {
    // Listen to connection state
    const unsubscribeConn = syncService.onConnectionChange((connected, count) => {
      setIsSyncConnected(connected);
      setConnectedDevicesCount(count);
    });

    // Listen to sync events from other devices / tabs
    const unsubscribeSync = syncService.onSync((payload: SyncPayload) => {
      if (payload.type === 'PATIENT_CREATED') {
        const newPat: Patient = payload.data;
        setPatients((prev) => {
          const exists = prev.some((p) => p.id === newPat.id);
          if (exists) return prev;
          const updated = [newPat, ...prev];
          setLocalPatients(updated);
          return updated;
        });
      } else if (payload.type === 'PATIENT_UPDATED') {
        const updatedPat: Patient = payload.data;
        setPatients((prev) => {
          const updated = prev.map((p) => (p.id === updatedPat.id ? updatedPat : p));
          setLocalPatients(updated);
          return updated;
        });
      } else if (payload.type === 'PATIENT_DELETED') {
        const { id } = payload.data;
        setPatients((prev) => {
          const updated = prev.filter((p) => p.id !== id);
          setLocalPatients(updated);
          return updated;
        });
      } else if (payload.type === 'SETTINGS_UPDATED') {
        const updatedSettings: ClinicSettings = payload.data;
        setSettings(updatedSettings);
        setLocalSettings(updatedSettings);
      } else if (payload.type === 'FULL_SYNC') {
        if (payload.data.patients) {
          setPatients(payload.data.patients);
          setLocalPatients(payload.data.patients);
        }
        if (payload.data.settings) {
          setSettings(payload.data.settings);
          setLocalSettings(payload.data.settings);
        }
      }
    });

    // Initial server pull attempt
    syncService.pullServerData().then((serverData) => {
      if (serverData && serverData.patients && serverData.patients.length > 0) {
        setPatients(serverData.patients);
        setLocalPatients(serverData.patients);
        if (serverData.settings) {
          setSettings(serverData.settings);
          setLocalSettings(serverData.settings);
        }
      } else {
        // Seed server with initial local data if empty
        const currentPats = getLocalPatients();
        const currentSets = getLocalSettings();
        fetch('/api/sync/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patients: currentPats, settings: currentSets }),
        }).catch(() => {});
      }
    });

    return () => {
      unsubscribeConn();
      unsubscribeSync();
    };
  }, []);

  // Save new or updated patient
  const handleSavePatient = useCallback((patient: Patient, printNow?: boolean) => {
    setPatients((prev) => {
      const idx = prev.findIndex((p) => p.id === patient.id);
      let updated: Patient[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = patient;
        syncService.syncPatientUpdate(patient);
      } else {
        updated = [patient, ...prev];
        syncService.syncPatientCreation(patient);
      }
      setLocalPatients(updated);
      return updated;
    });

    if (printNow) {
      setPrintingPatient(patient);
      setIsPrintInvoiceOpen(true);
    }
  }, []);

  // Delete patient
  const handleDeletePatient = useCallback((patientId: string) => {
    setPatients((prev) => {
      const updated = prev.filter((p) => p.id !== patientId);
      setLocalPatients(updated);
      syncService.syncPatientDeletion(patientId);
      return updated;
    });
  }, []);

  // Update status (e.g. waiting -> in_consultation -> completed)
  const handleUpdateStatus = useCallback((patientId: string, newStatus: PatientStatus) => {
    setPatients((prev) => {
      const updated = prev.map((p) => {
        if (p.id === patientId) {
          const changed = { ...p, status: newStatus, updatedAt: new Date().toISOString() };
          syncService.syncPatientUpdate(changed);
          return changed;
        }
        return p;
      });
      setLocalPatients(updated);
      return updated;
    });
  }, []);

  // Update follow up date
  const handleUpdateFollowUp = useCallback((patientId: string, newDate: string | null) => {
    setPatients((prev) => {
      const updated = prev.map((p) => {
        if (p.id === patientId) {
          const changed = { ...p, followUpDate: newDate, updatedAt: new Date().toISOString() };
          syncService.syncPatientUpdate(changed);
          return changed;
        }
        return p;
      });
      setLocalPatients(updated);
      return updated;
    });
  }, []);

  // Register today's visit from follow-up reminder
  const handleRegisterTodayVisit = useCallback((existingPatient: Patient) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().substring(0, 5);

    const followUpVisit: Patient = {
      ...existingPatient,
      id: 'pat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      code: `MRN-${Math.floor(100 + Math.random() * 900)}`,
      visitDate: todayStr,
      visitTime: timeStr,
      status: 'waiting',
      followUpDate: null,
      notes: `حضور موعد مراجعة مجدول من زيارة سابقة (${existingPatient.visitDate})`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    handleSavePatient(followUpVisit);
    setActiveTab('reception');
  }, [handleSavePatient]);

  // Save Settings
  const handleSaveSettings = useCallback((newSettings: ClinicSettings) => {
    setSettings(newSettings);
    setLocalSettings(newSettings);
    syncService.syncSettingsUpdate(newSettings);
  }, []);

  // Toggle Dark Mode
  const handleToggleDarkMode = useCallback(() => {
    setSettings((prev) => {
      const updated = { ...prev, darkMode: !prev.darkMode };
      setLocalSettings(updated);
      syncService.syncSettingsUpdate(updated);
      return updated;
    });
  }, []);

  // Calculate alerts badge
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingAlertsCount = patients.filter((p) => {
    if (!p.followUpDate) return false;
    return p.followUpDate <= todayStr && p.status !== 'cancelled';
  }).length;

  const todayPatientsCount = patients.filter((p) => p.visitDate === todayStr).length;

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-slate-900 dark:text-white transition-colors flex flex-col font-sans">
      
      {/* Top Bar with Secretary Profile */}
      <Header
        settings={settings}
        patients={patients}
        onOpenNewPatientModal={() => {
          setEditingPatient(null);
          setIsPatientModalOpen(true);
        }}
        onNavigateToAlerts={() => setActiveTab('alerts')}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenSettings={() => setActiveTab('settings')}
        isSyncConnected={isSyncConnected}
        connectedDevicesCount={connectedDevicesCount}
      />

      {/* Navigation (Segmented on Desktop / Floating Glass Bottom on Mobile) */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingAlertsCount={pendingAlertsCount}
        todayPatientsCount={todayPatientsCount}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Tab 1: القائمة الرئيسية (الاستقبال وتسجيل المرضى) */}
        {activeTab === 'reception' && (
          <DailyReceptionView
            patients={patients}
            settings={settings}
            onOpenNewPatientModal={() => {
              setEditingPatient(null);
              setIsPatientModalOpen(true);
            }}
            onEditPatient={(patient) => {
              setEditingPatient(patient);
              setIsPatientModalOpen(true);
            }}
            onDeletePatient={handleDeletePatient}
            onPrintInvoice={(patient) => {
              setPrintingPatient(patient);
              setIsPrintInvoiceOpen(true);
            }}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {/* Tab 2: السجل الشهري والتقارير المالية */}
        {activeTab === 'monthly' && (
          <MonthlyArchiveView
            patients={patients}
            settings={settings}
            onPrintInvoice={(patient) => {
              setPrintingPatient(patient);
              setIsPrintInvoiceOpen(true);
            }}
            onEditPatient={(patient) => {
              setEditingPatient(patient);
              setIsPatientModalOpen(true);
            }}
          />
        )}

        {/* Tab 3: تنبيهات المراجعة التلقائية */}
        {activeTab === 'alerts' && (
          <FollowUpAlertsView
            patients={patients}
            settings={settings}
            onUpdateFollowUp={handleUpdateFollowUp}
            onRegisterTodayVisit={handleRegisterTodayVisit}
          />
        )}

        {/* Tab 4: الإعدادات والصلاحيات */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            isSyncConnected={isSyncConnected}
            connectedDevicesCount={connectedDevicesCount}
          />
        )}

      </main>

      {/* Patient Registration Modal (5 Required Items + Clinical Workflow) */}
      <PatientRegistrationModal
        isOpen={isPatientModalOpen}
        onClose={() => {
          setIsPatientModalOpen(false);
          setEditingPatient(null);
        }}
        onSave={handleSavePatient}
        editingPatient={editingPatient}
        currency={settings.currency}
        defaultFee={settings.defaultFee || 25000}
        defaultDoctorName={settings.doctorName}
      />

      {/* Direct Print Invoice Modal */}
      <PrintInvoiceModal
        isOpen={isPrintInvoiceOpen}
        onClose={() => {
          setIsPrintInvoiceOpen(false);
          setPrintingPatient(null);
        }}
        patient={printingPatient}
        settings={settings}
      />

      {/* Discreet Footer (Desktop only) */}
      <footer className="no-print hidden md:block py-4 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-400 dark:text-slate-600">
        <p>
          نظام عيادتي برو لإدارة وسكرتارية العيادات الطبية · جميع البيانات مزامنة لحظياً عبر الأجهزة
        </p>
      </footer>

    </div>
  );
}
