import { validateResult } from "@/services/analysis";
import type { Analysis, Capture } from "@/lib/demo-store";

/** Simulation only. Never call from a real-user adapter. */
export async function simulateAnalysis(
  image: Capture,
  measurement: string,
  count: number,
): Promise<Analysis> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return validateResult({
    id: crypto.randomUUID(),
    imageId: image.id,
    palmId: image.palmId,
    sampleId: image.sampleId,
    variety: image.variety,
    capturedAt: image.capturedAt,
    analyzedAt: new Date().toISOString(),
    status: "completed",
    modelVersion: "demo-v1",
    measurement,
    stage: ["خلال", "رطب", "تمر"][count % 3]!,
    ...(measurement === "ripe-fruit-share-v1" ? { ripePercent: [60, 75, 68, 80][count % 4]! } : {}),
    confidence: 0.91,
  });
}
