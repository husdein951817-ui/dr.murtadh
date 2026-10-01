import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory + file persistent store
const DATA_FILE = path.join(__dirname, 'clinic_data_store.json');

interface StoreState {
  patients: any[];
  settings: any;
  lastUpdated: number;
}

let storeState: StoreState = {
  patients: [],
  settings: null,
  lastUpdated: Date.now(),
};

// Load saved data if exists
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    storeState = JSON.parse(raw);
  }
} catch (e) {
  console.error('Error loading data file:', e);
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(storeState, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving data file:', e);
  }
}

// SSE connected clients
const sseClients: { id: string; res: express.Response }[] = [];

function broadcast(event: string, data: any, sourceId?: string) {
  const payload = JSON.stringify({ event, data, sourceId, timestamp: Date.now() });
  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch {
      // ignore
    }
  });
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), connectedDevices: sseClients.length });
});

app.get('/api/data', (req, res) => {
  res.json(storeState);
});

// Update or initialize full state
app.post('/api/sync/full', (req, res) => {
  const { patients, settings, sourceId } = req.body;
  if (patients) storeState.patients = patients;
  if (settings) storeState.settings = settings;
  storeState.lastUpdated = Date.now();
  saveStore();
  broadcast('FULL_SYNC', { patients: storeState.patients, settings: storeState.settings }, sourceId);
  res.json({ success: true, lastUpdated: storeState.lastUpdated });
});

// Create patient
app.post('/api/patients', (req, res) => {
  const { patient, sourceId } = req.body;
  if (!patient || !patient.id) {
    return res.status(400).json({ error: 'Patient data with id required' });
  }
  // Idempotent: replace or prepend
  const existingIdx = storeState.patients.findIndex((p) => p.id === patient.id);
  if (existingIdx >= 0) {
    storeState.patients[existingIdx] = patient;
  } else {
    storeState.patients.unshift(patient);
  }
  storeState.lastUpdated = Date.now();
  saveStore();
  broadcast('PATIENT_CREATED', patient, sourceId);
  res.json({ success: true, patient });
});

// Update patient
app.put('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  const { patient, sourceId } = req.body;
  const idx = storeState.patients.findIndex((p) => p.id === id);
  if (idx >= 0) {
    storeState.patients[idx] = { ...storeState.patients[idx], ...patient, updatedAt: new Date().toISOString() };
    storeState.lastUpdated = Date.now();
    saveStore();
    broadcast('PATIENT_UPDATED', storeState.patients[idx], sourceId);
    res.json({ success: true, patient: storeState.patients[idx] });
  } else {
    // If not found, add it
    storeState.patients.unshift(patient);
    storeState.lastUpdated = Date.now();
    saveStore();
    broadcast('PATIENT_CREATED', patient, sourceId);
    res.json({ success: true, patient });
  }
});

// Delete patient
app.delete('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  const sourceId = req.query.sourceId as string;
  storeState.patients = storeState.patients.filter((p) => p.id !== id);
  storeState.lastUpdated = Date.now();
  saveStore();
  broadcast('PATIENT_DELETED', { id }, sourceId);
  res.json({ success: true, id });
});

// Update settings
app.put('/api/settings', (req, res) => {
  const { settings, sourceId } = req.body;
  storeState.settings = { ...storeState.settings, ...settings };
  storeState.lastUpdated = Date.now();
  saveStore();
  broadcast('SETTINGS_UPDATED', storeState.settings, sourceId);
  res.json({ success: true, settings: storeState.settings });
});

// Server-Sent Events (SSE) for Real-Time Sync across all devices
app.get('/api/sync/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = Math.random().toString(36).substring(2, 9);
  sseClients.push({ id: clientId, res });

  // Send initial ping and connection confirmation
  res.write(`data: ${JSON.stringify({ event: 'CONNECTED', clientId, clientsCount: sseClients.length })}\n\n`);

  // Heartbeat every 20 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(`:ping\n\n`);
    } catch {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const index = sseClients.findIndex((c) => c.id === clientId);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
