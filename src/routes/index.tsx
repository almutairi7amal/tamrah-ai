import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PalmIllustration } from "@/components/tamra/PalmIllustration";
import { DemoBadge } from "@/components/tamra/Brand";
import { loadDemo, saveDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تمرة — تسجيل الدخول" },
      { name: "description", content: "ادخل إلى تمرة أو جرّب العرض التجريبي لمتابعة نخلتك." },
      { property: "og:title", content: "تمرة — تسجيل الدخول" },
      { property: "og:description", content: "تابع قراءات نخلتك وافهم التوصيات ببساطة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("اكتب بريدًا إلكترونيًا صحيحًا.");
    if (!password) return setError("اكتب كلمة المرور.");
    setPassword("");
    setError("تسجيل الدخول غير متصل بعد. استخدم «تجربة تمرة» للتجربة الآن.");
  }

  function startDemo() {
    const s = saveDemo({ active: true });
    navigate({ to: s.palm ? "/home" : "/connect" });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-3xl font-extrabold text-primary">تمرة</span>
        <DemoBadge />
      </div>
      <PalmIllustration className="mx-auto h-40 w-40" />
      <h1 className="mt-4 text-center text-2xl font-bold">أهلًا بك في تمرة</h1>
      <p className="mt-1 text-center text-muted-foreground">تابع نخلتك وافهم وش تحتاج.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" type="email" dir="ltr" className="h-12 bg-card text-base" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} dir="ltr" className="h-12 bg-card pl-12 text-base" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
        <Button type="submit" variant="outline" className="h-12 w-full text-base">دخول</Button>
      </form>

      <Button onClick={() => (loadDemo(), startDemo())} className="mt-3 h-14 w-full rounded-2xl text-lg font-bold">تجربة تمرة</Button>
      <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        تسجيل الدخول الحقيقي غير متصل بعد، ولا نحفظ أي كلمة مرور.
      </p>
    </main>
  );
}
