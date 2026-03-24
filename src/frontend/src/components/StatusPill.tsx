import { Badge } from "@/components/ui/badge";
import { LeadStatus } from "../backend.d";

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  [LeadStatus.new_]: {
    label: "New",
    className:
      "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30",
  },
  [LeadStatus.contacted]: {
    label: "Contacted",
    className:
      "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30",
  },
  [LeadStatus.qualified]: {
    label: "Qualified",
    className:
      "bg-teal-500/20 text-teal-400 border-teal-500/30 hover:bg-teal-500/30",
  },
  [LeadStatus.proposal]: {
    label: "Proposal",
    className:
      "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30",
  },
  [LeadStatus.closedWon]: {
    label: "Closed Won",
    className:
      "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
  },
  [LeadStatus.closedLost]: {
    label: "Closed Lost",
    className:
      "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
  },
};

export function StatusPill({ status }: { status: LeadStatus }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium px-2 py-0.5 ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

export { statusConfig };
