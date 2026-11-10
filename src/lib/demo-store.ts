export const VARIETIES = ["خلاص", "سكري", "صقعي", "برحي", "عجوة", "رزيز"];
export interface PalmSetup {
  id: string;
  name: string;
  variety: string;
  sampleId: string;
}
export interface Capture {
  id: string;
  palmId: string;
  sampleId: string;
  variety: string;
  capturedAt: string;
  url: string;
  source: "manual" | "device";
}
export type AnalysisStatus = "not_started" | "processing" | "completed" | "failed" | "unsuitable";
export interface Analysis {
  id: string;
  imageId: string;
  palmId: string;
  sampleId: string;
  variety: string;
  capturedAt: string;
  analyzedAt: string;
  status: AnalysisStatus;
  stage?: string;
  ripePercent?: number;
  confidence?: number;
  modelVersion: string;
  measurement: string;
  error?: string;
}
export interface Device {
  id: string;
  palmId: string;
  linkedAt: string;
  lastSeen: string | null;
}
export interface SensorReading {
  id: string;
  deviceId: string;
  palmId: string;
  label: string;
  value: number;
  unit: string;
  recordedAt: string;
}
export interface Intervention {
  id: string;
  palmId: string;
  sampleId: string;
  at: string;
  label: string;
}
export interface DemoState {
  active: boolean;
  palm: PalmSetup | null;
  device: Device | null;
  images: Capture[];
  analyses: Analysis[];
  sensors: SensorReading[];
  interventions: Intervention[];
  actions?: { id: string; at: number }[];
}
const KEY = "tamra-demo-v2";
const empty = (): DemoState => ({
  active: false,
  palm: null,
  device: null,
  images: [],
  analyses: [],
  sensors: [],
  interventions: [],
});
export function loadDemo(): DemoState {
  if (typeof window === "undefined") return empty();
  try {
    return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return empty();
  }
}
export function saveDemo(patch: Partial<DemoState>) {
  const next = { ...loadDemo(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
export function clearDemo() {
  localStorage.removeItem(KEY);
}
export function connected(device: Device | null, now = Date.now()) {
  if (!device?.lastSeen) return false;
  const age = now - Date.parse(device.lastSeen);
  return age >= 0 && age <= 15 * 60 * 1000;
}
export function comparable(analyses: Analysis[], palm: PalmSetup, measurement: string) {
  return analyses
    .filter(
      (a) =>
        a.status === "completed" &&
        a.palmId === palm.id &&
        a.sampleId === palm.sampleId &&
        a.variety === palm.variety &&
        a.measurement === measurement,
    )
    .sort((a, b) => Date.parse(a.capturedAt) - Date.parse(b.capturedAt));
}
