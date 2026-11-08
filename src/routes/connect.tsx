import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Info, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader, DemoBadge } from "@/components/tamra/Brand";
import { PalmForm } from "@/components/tamra/PalmForm";
import { DEMO_PAIRING_CODE, loadDemo, normalizeCode, saveDemo, type PalmSetup } from "@/lib/demo-store";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "تمرة — اربط جهازك" },
      { name: "description", content: "اربط جهاز تمرة بحسابك وجهّز بيانات نخلتك." },
      { property: "og:title", content: "تمرة — اربط جهازك" },
      { property: "og:description", content: "اربط الجهاز بحسابك عبر رمز الإقران." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Connect,
});

function Connect() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scanMsg, setScanMsg] = useState(false);
  const [paired, setPaired] = useState(false);
  const [palm, setPalm] = useState<PalmSetup>({ name: "نخلتي", variety: "خلاص", stage: "" });
  const [stageErr, setStageErr] = useState(false);

  useEffect(() => {
    if (!loadDemo().active) navigate({ to: "/" });
  }, [navigate]);

  function pair(e: FormEvent) {
    e.preventDefault();
    const c = normalizeCode(code);
    if (!c) return setError("اكتب رمز الجهاز.");
    if (c !== DEMO_PAIRING_CODE) return setError(`الرمز غير صحيح. في العرض التجريبي استخدم ${DEMO_PAIRING_CODE}.`);
    setError(null);
    setPaired(true);
  }

  function start() {
    if (!palm.name.trim()) return;
    if (!palm.stage) return setStageErr(true);
    saveDemo({ palm: { ...palm, name: palm.name.trim() } });
    navigate({ to: "/home" });
  }

  return (
    <div className="min-h-screen">
      <AppHeader><DemoBadge /></AppHeader>
      <main className="mx-auto max-w-md px-5 py-8">
        {!paired ? (
          <>
            <h1 className="text-2xl font-bold">اربط جهازك</h1>
            <p className="mt-1 text-muted-foreground">الربط يوصل الجهاز بحسابك، ولا يضبط شبكة الواي فاي في الجهاز.</p>

            <Button variant="outline" className="mt-6 h-14 w-full gap-2 bg-card text-base" onClick={() => setScanMsg(true)}>
              <QrCode className="h-5 w-5" /> مسح رمز الجهاز
            </Button>
            {scanMsg && (
              <p role="status" className="mt-3 rounded-2xl bg-amber p-4 text-sm text-amber-foreground">
                المسح بالكاميرا يتفعّل لما نربط إقران الأجهزة. اكتب الرمز يدويًا تحت.
              </p>
            )}

            <form onSubmit={pair} className="mt-6 space-y-3" noValidate>
              <Label htmlFor="code">أو اكتب رمز الإقران</Label>
              <Input id="code" dir="ltr" autoCapitalize="characters" placeholder="TAMRA01" className="h-12 bg-card text-center text-lg tracking-widest" value={code} onChange={(e) => setCode(e.target.value)} />
              {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
              <Button type="submit" className="h-12 w-full text-base">ربط الجهاز</Button>
            </form>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" /> رمز العرض التجريبي: <span dir="ltr" className="font-bold text-foreground">{DEMO_PAIRING_CODE}</span>
            </p>
          </>
        ) : (
          <>
            <button onClick={() => setPaired(false)} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground">
              <ArrowRight className="h-4 w-4" /> رجوع
            </button>
            <h1 className="text-2xl font-bold">تم ربط الجهاز</h1>
            <p className="mb-6 mt-1 text-muted-foreground">عرّفنا على نخلتك.</p>
            <PalmForm value={palm} onChange={(v) => { setPalm(v); if (v.stage) setStageErr(false); }} />
            {!palm.name.trim() && <p role="alert" className="mt-3 text-sm font-semibold text-destructive">اكتب اسم النخلة.</p>}
            {stageErr && <p role="alert" className="mt-3 text-sm font-semibold text-destructive">اختر مرحلة النمو.</p>}
            <Button onClick={start} className="mt-8 h-14 w-full rounded-2xl text-lg font-bold">ابدأ المتابعة</Button>
          </>
        )}
      </main>
    </div>
  );
}
