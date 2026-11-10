import { describe, expect, it } from "vitest";
import { simulateAnalysis } from "@/services/demo-analysis";
import { loadDemo, saveDemo, type Capture } from "@/lib/demo-store";

describe("Guest demo lifecycle", () => {
  it("saves a palm and a first image/result then retains history on return", async () => {
    localStorage.clear();
    expect(loadDemo().active).toBe(false);
    saveDemo({ active: true });
    expect(loadDemo().palm).toBeNull();
    const palm = { id: "p", name: "نخلة التجربة", variety: "سكري", sampleId: "bunch-1" };
    saveDemo({ palm });
    const image: Capture = {
      id: "img",
      palmId: "p",
      sampleId: "bunch-1",
      variety: "سكري",
      capturedAt: "2026-10-01T10:00:00Z",
      url: "data:image/png;base64,demo",
      source: "manual",
    };
    const first = await simulateAnalysis(image, "stage", 0);
    saveDemo({ images: [image], analyses: [first] });
    const second = await simulateAnalysis({ ...image, id: "img2" }, "ripe-fruit-share-v1", 0);
    saveDemo({
      images: [...loadDemo().images, { ...image, id: "img2" }],
      analyses: [...loadDemo().analyses, second],
    });
    saveDemo({ active: false });
    saveDemo({ active: true });
    expect(loadDemo().palm?.variety).toBe("سكري");
    expect(loadDemo().analyses).toHaveLength(2);
    expect(first.ripePercent).toBeUndefined();
    expect(second.ripePercent).toBe(60);
    expect(first.modelVersion).toBe("demo-v1");
  });
});
