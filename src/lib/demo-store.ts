// Non-sensitive demo setup stored locally. Never stores credentials.
export const DEMO_PAIRING_CODE = "TAMRA01";
export const VARIETIES = ["خلاص", "سكري", "صقعي", "برحي", "عجوة", "رزيز"];
export const STAGES = ["الحبابوك", "الكمري", "الخلال", "الرطب", "التمر"];

export interface PalmSetup {
  name: string;
  variety: string;
  stage: string;
}

export interface DemoState {
  active: boolean;
  palm: PalmSetup | null;
  actions: { id: string; at: number }[];
}

const KEY = "tamra-demo-v1";
const empty: DemoState = { active: false, palm: null, actions: [] };

export function loadDemo(): DemoState {
  if (typeof window === "undefined") return empty;
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return empty;
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

export function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}
