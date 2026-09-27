import { Narrative } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { EvidenceMeter } from "./EvidenceMeter";

const stanceColor: Record<string, string> = {
  supporting: "bg-emerald-100 text-emerald-800",
  opposing: "bg-red-100 text-red-800",
  mixed: "bg-amber-100 text-amber-800",
};

export function NarrativeCard({ narrative }: { narrative: Narrative }) {
  return (
    <div className="border rounded-lg p-4 space-y-2 bg-white">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-sm">{narrative.narrative_name}</h4>
        <Badge className={stanceColor[narrative.stance_balance] || ""}>
          {narrative.stance_balance}
        </Badge>
      </div>
      <p className="text-sm text-neutral-600">{narrative.summary}</p>
      {narrative.evidence && (
        <EvidenceMeter
          strength={narrative.evidence.evidence_strength}
          label={narrative.evidence.confidence_label}
        />
      )}
      <p className="text-xs text-neutral-400">{narrative.claims.length} supporting claims</p>
    </div>
  );
}