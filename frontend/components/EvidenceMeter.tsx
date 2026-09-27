export function EvidenceMeter({ strength, label }: { strength: number; label: string }) {
  const color =
    strength >= 70 ? "bg-emerald-500" : strength >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${strength}%` }} />
      </div>
      <span className="text-xs font-medium text-neutral-600 whitespace-nowrap">
        {strength}% · {label}
      </span>
    </div>
  );
}