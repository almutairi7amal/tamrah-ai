import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppHeader, DemoBadge } from "@/components/tamra/Brand";
import {
  loadDemo,
  saveDemo,
  connected,
  comparable,
  type DemoState,
  type Analysis,
  type Capture,
} from "@/lib/demo-store";
import { analysisLabels, demoModelConfig } from "@/services/analysis";
import { simulateAnalysis } from "@/services/demo-analysis";
import { preparePreview } from "@/services/presentation-preview";
export const Route = createFileRoute("/tracking")({ component: Home });
const date = (s: string) =>
  new Date(s).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" });
export function Progress({ data, onSelect }: { data: DemoState; onSelect: (a: Analysis) => void }) {
  const palm = data.palm!;
  const measurements = [
    ...new Set(
      data.analyses
        .filter(
          (a) =>
            a.palmId === palm.id &&
            a.sampleId === palm.sampleId &&
            a.variety === palm.variety &&
            a.status === "completed",
        )
        .map((a) => a.measurement),
    ),
  ];
  const [choice, setChoice] = useState("");
  const measurement = measurements.includes(choice) ? choice : measurements[0] || "";
  const rows = comparable(data.analyses, palm, measurement);
  const numeric = rows.length > 0 && rows.every((a) => a.ripePercent !== undefined);
  const first = rows[0],
    last = rows.at(-1);
  const delta = numeric && first && last ? last.ripePercent! - first.ripePercent! : null;
  return (
    <section className="panel">
      <h2>تطوّر نضج التمر</h2>
      {measurements.length > 1 && (
        <label>
          تعريف القياس
          <select
            className="m-2 rounded border p-2"
            value={measurement}
            onChange={(e) => setChoice(e.target.value)}
          >
            {measurements.map((m) => (
              <option key={m} value={m}>
                {m === "stage"
                  ? "المرحلة المقدّرة"
                  : m === "ripe-fruit-share-v1"
                    ? "نسبة الثمار الناضجة"
                    : m}
              </option>
            ))}
          </select>
        </label>
      )}
      {!rows.length ? (
        <p>ابدئي أول تحليل</p>
      ) : (
        <>
          {rows.length === 1 && <p>هذه نقطة البداية، أضيفي قراءة أخرى لمتابعة التغيّر</p>}
          {numeric ? (
            <>
              <p className="text-sm">نسبة الثمار الناضجة (٪) · اختاري قراءة من السجل لعرض صورتها</p>
              <div dir="ltr" className="mt-4 h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={rows.map((a) => ({ ...a, time: Date.parse(a.capturedAt) }))}
                    margin={{ left: 0, right: 15, bottom: 20 }}
                  >
                    <XAxis
                      dataKey="time"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={(v) => new Date(v).toLocaleDateString("ar-SA")}
                    />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip labelFormatter={(v) => date(new Date(Number(v)).toISOString())} />
                    <Line
                      type="linear"
                      dataKey="ripePercent"
                      name="الثمار الناضجة"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      isAnimationActive={false}
                    />
                    {data.interventions
                      .filter((i) => i.palmId === palm.id && i.sampleId === palm.sampleId)
                      .map((i) => (
                        <ReferenceLine
                          key={i.id}
                          x={Date.parse(i.at)}
                          stroke="var(--palm-date)"
                          label={i.label}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {rows.length > 1 && (
                <p>
                  {delta! >= 0 ? "زيادة" : "انخفاض"} {Math.abs(delta!)} نقطة مئوية بين أول وآخر
                  قراءة.
                </p>
              )}
            </>
          ) : (
            <ol className="mt-4 flex flex-wrap gap-3">
              {rows.map((a) => (
                <li key={a.id}>
                  <Button variant="secondary" onClick={() => onSelect(a)}>
                    {date(a.capturedAt)} · {a.stage || "مرحلة غير متاحة"}
                  </Button>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {rows.map((a, i) => (
              <Button key={a.id} variant="outline" onClick={() => onSelect(a)}>
                قراءة {i + 1}
              </Button>
            ))}
          </div>
        </>
      )}
      {data.interventions
        .filter((i) => i.palmId === palm.id && i.sampleId === palm.sampleId)
        .map((i) => (
          <p key={i.id} className="mt-2 text-sm">
            تدخّل: {i.label} · {date(i.at)}
          </p>
        ))}
      <p className="mt-3 text-xs text-muted-foreground">
        تُقارن العينة والصنف وتعريف القياس نفسها فقط. التدخّل المسجّل لا يثبت سبب تغيّر النضج.
      </p>
    </section>
  );
}
function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState<DemoState | null>(null);
  const [selected, setSelected] = useState<Analysis | null>(null);
  const [image, setImage] = useState<Capture | null>(null);
  const [capturedAt, setCapturedAt] = useState("");
  const [kind, setKind] = useState("ripe-fruit-share-v1");
  const [status, setStatus] = useState<Analysis["status"]>("not_started");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const d = preparePreview();
    if (!d.active) {
      void navigate({ to: "/" });
      return;
    }
    if (!d.palm) {
      void navigate({ to: "/connect" });
      return;
    }
    setData(d);
    setNow(Date.now());
    const timer = setInterval(() => {
      setNow(Date.now());
      setData(preparePreview());
    }, 30000);
    return () => clearInterval(timer);
  }, [navigate]);
  function persist(patch: Partial<DemoState>) {
    try {
      const next = saveDemo(patch);
      setData(next);
      return next;
    } catch {
      setMessage("تعذّر الحفظ المحلي. قد تكون مساحة التخزين ممتلئة.");
      return null;
    }
  }
  async function upload(file?: File) {
    setMessage("");
    setImage(null);
    setStatus("not_started");
    if (!file || !data?.palm) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      setStatus("unsuitable");
      setMessage("اختاري صورة صالحة بحجم لا يزيد على 2 ميجابايت.");
      return;
    }
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => (img.width > 0 ? resolve() : reject());
        img.onerror = reject;
        img.src = url;
      });
      setImage({
        id: crypto.randomUUID(),
        palmId: data.palm.id,
        sampleId: data.palm.sampleId,
        variety: data.palm.variety,
        capturedAt: new Date().toISOString(),
        url,
        source: "manual",
      });
    } catch {
      setStatus("unsuitable");
      setMessage("تعذّر فتح الصورة. اختاري صورة أخرى.");
    }
  }
  async function analyze() {
    if (!data?.palm || !image) return;
    const at = capturedAt ? new Date(capturedAt).toISOString() : image.capturedAt;
    if (Date.parse(at) > Date.now()) {
      setMessage("وقت الالتقاط لا يمكن أن يكون في المستقبل.");
      return;
    }
    setBusy(true);
    setStatus("processing");
    const count = data.analyses.filter(
      (a) => a.sampleId === data.palm!.sampleId && a.measurement === kind,
    ).length;
    let a: Analysis;
    try {
      a = await simulateAnalysis({ ...image, capturedAt: at }, kind, count);
    } catch {
      setStatus("failed");
      setMessage("تعذّر التحليل. يمكنك إعادة المحاولة.");
      setBusy(false);
      return;
    }
    const saved = persist({
      images: [...data.images, { ...image, capturedAt: at }],
      analyses: [...data.analyses, a],
    });
    setStatus(saved ? "completed" : "failed");
    setBusy(false);
    if (saved) {
      setSelected(a);
      setImage(null);
    }
  }
  if (!data?.palm) return null;
  const palm = data.palm;
  const supported = demoModelConfig.supportedVarieties.includes(palm.variety);
  const history = data.analyses
    .filter(
      (a) => a.palmId === palm.id && a.sampleId === palm.sampleId && a.variety === palm.variety,
    )
    .sort((a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt));
  const last = history.find((a) => a.status === "completed");
  const shown = selected || last;
  const photo = data.images.find((i) => i.id === shown?.imageId);
  const sensors = data.sensors.filter((s) => s.palmId === palm.id);
  return (
    <>
      <AppHeader>
        <DemoBadge />
        <Button variant="secondary" onClick={() => navigate({ to: "/home" })}>
          الرئيسية
        </Button>
        <Button variant="secondary" onClick={() => navigate({ to: "/connect" })}>
          الإعدادات
        </Button>
      </AppHeader>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{palm.name}</h1>
            <p className="mt-2 text-muted-foreground">
              {palm.variety} · العينة: {palm.sampleId}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              saveDemo({ active: false });
              void navigate({ to: "/" });
            }}
          >
            تسجيل الخروج
          </Button>
        </div>
        {!supported && <p className="panel">تحليل النضج غير متاح لهذا الصنف حاليًا</p>}
        <div className="grid gap-5 md:grid-cols-2">
          <section className="panel">
            <h2>آخر تحليل</h2>
            <p className="text-2xl font-bold text-primary">
              {last?.stage || "لا توجد مرحلة مقدّرة بعد"}
            </p>
            <p>{last ? date(last.analyzedAt) : "لم يبدأ التحليل"}</p>
            {last?.ripePercent !== undefined && <p>الثمار الناضجة: {last.ripePercent}٪</p>}
            <a href="#new-analysis" className="mt-4 inline-block font-bold text-primary">
              إضافة تحليل جديد ←
            </a>
          </section>
          <section className="panel">
            <h2>حالة الجهاز</h2>
            <p>{data.device ? "الجهاز مرتبط بالنخلة" : "لا يوجد جهاز مرتبط"}</p>
            <p>{connected(data.device, now) ? "الجهاز متصل الآن" : "لا يوجد تواصل حديث"}</p>
            <p className="mt-2 text-sm">
              آخر تواصل: {data.device?.lastSeen ? date(data.device.lastSeen) : "غير متاح"}
            </p>
          </section>
        </div>
        <section className="panel">
          <h2>قراءات الحساسات</h2>
          {!sensors.length ? (
            <>
              <p>لا توجد قراءات متاحة بعد.</p>
              <Button
                variant="secondary"
                disabled={!data.device}
                onClick={() => {
                  const t = new Date().toISOString();
                  persist({
                    device: { ...data.device!, lastSeen: t },
                    sensors: [
                      ...data.sensors,
                      ...[
                        { label: "حرارة الجو", value: 35.2, unit: "°C" },
                        { label: "رطوبة الجو", value: 42, unit: "%" },
                      ].map((s) => ({
                        ...s,
                        id: crypto.randomUUID(),
                        deviceId: data.device!.id,
                        palmId: palm.id,
                        recordedAt: t,
                      })),
                    ],
                  });
                }}
              >
                تحديث القراءات
              </Button>
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {sensors
                .filter(
                  (s) => !sensors.some((n) => n.label === s.label && n.recordedAt > s.recordedAt),
                )
                .map((s) => (
                  <div key={s.id} className="rounded-2xl bg-secondary p-4">
                    <p>{s.label}</p>
                    <p dir="ltr" className="text-right text-2xl font-bold">
                      {s.value} {s.unit}
                    </p>
                    <p className="text-xs">
                      {date(s.recordedAt)}{" "}
                      {now - Date.parse(s.recordedAt) > 900000 ? "· قراءة قديمة" : ""}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </section>
        <Progress data={data} onSelect={setSelected} />
        <section className="panel">
          <h2>{selected ? "القراءة المختارة" : "آخر صورة"}</h2>
          {photo ? (
            <div className="grid gap-4 md:grid-cols-2">
              <img
                src={photo.url}
                alt={"صورة " + photo.sampleId}
                className="max-h-72 w-full rounded-2xl object-contain"
              />
              <div>
                <p>الالتقاط: {date(photo.capturedAt)}</p>
                <p>التحليل: {shown && date(shown.analyzedAt)}</p>
                <p>
                  النتيجة: {shown?.stage}{" "}
                  {shown?.ripePercent !== undefined && "· " + shown.ripePercent + "٪ ثمار ناضجة"}
                </p>
                <p>
                  ثقة المودل:{" "}
                  {shown?.confidence !== undefined
                    ? Math.round(shown.confidence * 100) + "٪ (ليست نسبة النضج)"
                    : "غير متاحة"}
                </p>
              </div>
            </div>
          ) : (
            <p>لا توجد صورة محفوظة.</p>
          )}
        </section>
        <section id="new-analysis" className="panel space-y-4">
          <h2>إضافة تحليل جديد</h2>
          <p>العينة: {palm.sampleId}. اختاري صورة جديدة لمتابعة تطوّر النضج.</p>
          <Button
            variant="secondary"
            disabled={busy || !supported}
            onClick={() => {
              setStatus("not_started");
              setImage({
                id: crypto.randomUUID(),
                palmId: palm.id,
                sampleId: palm.sampleId,
                variety: palm.variety,
                capturedAt: new Date().toISOString(),
                url: "/images/date-bunch.svg",
                source: "device",
              });
            }}
          >
            استخدام صورة الجهاز
          </Button>
          <label className="block">
            رفع صورة يدويًا
            <Input
              type="file"
              accept="image/*"
              disabled={busy || !supported}
              onChange={(e) => void upload(e.target.files?.[0])}
            />
          </label>
          <label className="block">
            وقت الالتقاط (اختياري؛ الافتراضي الآن)
            <Input
              type="datetime-local"
              value={capturedAt}
              onChange={(e) => setCapturedAt(e.target.value)}
            />
          </label>
          {image && (
            <img
              src={image.url}
              alt="معاينة الصورة قبل التحليل"
              className="h-40 rounded-xl object-contain"
            />
          )}
          <label className="block">
            عرض النتيجة
            <select
              className="mx-2 rounded border bg-card p-2"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="stage">مرحلة فقط</option>
              <option value="ripe-fruit-share-v1">نسبة الثمار الناضجة</option>
            </select>
          </label>
          <p role="status">{analysisLabels[status]}</p>
          {message && <p role="alert">{message}</p>}
          <Button disabled={!image || busy || !supported} onClick={() => void analyze()}>
            بدء التحليل
          </Button>
        </section>
        <section className="panel">
          <h2>سجل التحليلات السابقة</h2>
          {!history.length ? (
            <p>ابدئي أول تحليل</p>
          ) : (
            <div className="space-y-3">
              {history.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="flex w-full flex-wrap justify-between gap-2 rounded-xl bg-secondary p-4 text-right"
                >
                  <span>{date(a.capturedAt)}</span>
                  <span>
                    {analysisLabels[a.status]} · {a.stage}{" "}
                    {a.ripePercent !== undefined && "· " + a.ripePercent + "٪"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
