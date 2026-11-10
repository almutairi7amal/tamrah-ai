import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { PalmForm } from "@/components/tamra/PalmForm";
import { Progress } from "@/routes/tracking";
import {
  comparable,
  connected,
  loadDemo,
  saveDemo,
  type Analysis,
  type DemoState,
} from "@/lib/demo-store";
import { validateResult } from "@/services/analysis";
const palm = { id: "p1", name: "نخلتي", variety: "خلاص", sampleId: "s1" };
const result = (patch: Partial<Analysis> = {}): Analysis => ({
  id: "a1",
  imageId: "i1",
  palmId: "p1",
  sampleId: "s1",
  variety: "خلاص",
  status: "completed",
  capturedAt: "2026-10-01T10:00:00Z",
  analyzedAt: "2026-10-01T10:01:00Z",
  stage: "خلال",
  modelVersion: "v1",
  measurement: "stage",
  ...patch,
});
const data = (analyses: Analysis[]): DemoState => ({
  active: true,
  palm,
  device: null,
  analyses,
  images: [],
  sensors: [],
  interventions: [],
});
beforeEach(() => {
  cleanup();
  localStorage.clear();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
describe("Palm setup and isolated demo persistence", () => {
  it("offers six varieties and no manual stage", () => {
    const onChange = vi.fn();
    render(<PalmForm value={palm} onChange={onChange} />);
    expect(screen.queryByText("مرحلة النمو")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "عجوة" }));
    expect(onChange).toHaveBeenCalledWith({ ...palm, variety: "عجوة" });
  });
  it("retains setup on return without mixing another storage namespace", () => {
    localStorage.setItem("real-user", "untouched");
    saveDemo({ active: true, palm: { ...palm, variety: "رزيز" } });
    saveDemo({ active: false });
    expect(loadDemo().palm?.variety).toBe("رزيز");
    expect(localStorage.getItem("real-user")).toBe("untouched");
  });
});
describe("Progress semantics", () => {
  it("shows empty and single baseline states without converting confidence to maturity", () => {
    const view = render(<Progress data={data([])} onSelect={vi.fn()} />);
    expect(screen.getByText("ابدئي أول تحليل")).toBeTruthy();
    view.rerender(<Progress data={data([result({ confidence: 0.99 })])} onSelect={vi.fn()} />);
    expect(screen.getByText("هذه نقطة البداية، أضيفي قراءة أخرى لمتابعة التغيّر")).toBeTruthy();
    expect(screen.queryByText(/نسبة الثمار الناضجة/)).toBeNull();
  });
  it("selects a stage reading and excludes other samples, varieties and measurements", () => {
    const a = result();
    const onSelect = vi.fn();
    const rows = [
      a,
      result({ sampleId: "s2" }),
      result({ variety: "عجوة" }),
      result({ measurement: "percentage" }),
    ];
    expect(comparable(rows, palm, "stage")).toEqual([a]);
    render(<Progress data={data([a])} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "قراءة 1" }));
    expect(onSelect).toHaveBeenCalledWith(a);
  });
  it("reports decreases in percentage points", () => {
    render(
      <Progress
        data={data([
          result({ ripePercent: 75 }),
          result({ id: "a2", capturedAt: "2026-10-02T10:00:00Z", ripePercent: 60 }),
        ])}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("انخفاض 15 نقطة مئوية بين أول وآخر قراءة.")).toBeTruthy();
  });
  it("does not treat linking or stale timestamps as online", () => {
    const device = { id: "d1", palmId: "p1", linkedAt: "2026-10-01", lastSeen: null };
    expect(connected(device)).toBe(false);
    expect(
      connected(
        { ...device, lastSeen: "2026-10-01T00:00:00Z" },
        Date.parse("2026-10-01T00:20:00Z"),
      ),
    ).toBe(false);
  });
  it("rejects invalid model percentages and incomplete results", () => {
    expect(() => validateResult(result({ ripePercent: 101 }))).toThrow();
    expect(() => validateResult(result({ sampleId: "" }))).toThrow();
  });
});
