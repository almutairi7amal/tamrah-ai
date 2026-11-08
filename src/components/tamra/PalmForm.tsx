import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STAGES, VARIETIES, type PalmSetup } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export function PalmForm({ value, onChange }: { value: PalmSetup; onChange: (v: PalmSetup) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="palm-name">اسم النخلة</Label>
        <Input id="palm-name" className="h-12 bg-card text-base" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      </div>
      <Chips label="الصنف" options={VARIETIES} selected={value.variety} onSelect={(variety) => onChange({ ...value, variety })} />
      <Chips label="مرحلة النمو" options={STAGES} selected={value.stage} onSelect={(stage) => onChange({ ...value, stage })} />
    </div>
  );
}

function Chips({ label, options, selected, onSelect }: { label: string; options: string[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={selected === o}
            onClick={() => onSelect(o)}
            className={cn(
              "rounded-full border px-4 py-2 text-base transition-colors",
              selected === o ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
