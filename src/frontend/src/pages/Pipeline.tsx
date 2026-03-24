import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { LeadStatus } from "../backend.d";
import type { Lead } from "../backend.d";
import { LeadDetailSheet } from "../components/LeadDetailSheet";
import { StatusPill } from "../components/StatusPill";
import { TopBar } from "../components/TopBar";
import { useLeads } from "../hooks/useQueries";

const COLUMNS: {
  status: LeadStatus;
  label: string;
  color: string;
  bg: string;
}[] = [
  {
    status: LeadStatus.new_,
    label: "New",
    color: "text-blue-400",
    bg: "border-blue-500/30",
  },
  {
    status: LeadStatus.contacted,
    label: "Contacted",
    color: "text-purple-400",
    bg: "border-purple-500/30",
  },
  {
    status: LeadStatus.qualified,
    label: "Qualified",
    color: "text-teal-400",
    bg: "border-teal-500/30",
  },
  {
    status: LeadStatus.proposal,
    label: "Proposal",
    color: "text-amber-400",
    bg: "border-amber-500/30",
  },
  {
    status: LeadStatus.closedWon,
    label: "Closed Won",
    color: "text-green-400",
    bg: "border-green-500/30",
  },
  {
    status: LeadStatus.closedLost,
    label: "Closed Lost",
    color: "text-red-400",
    bg: "border-red-500/30",
  },
];

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

export function PipelinePage() {
  const { data: leads, isLoading } = useLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<bigint | null>(null);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Pipeline" />
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div
            className="grid grid-cols-3 xl:grid-cols-6 gap-4"
            data-ocid="pipeline.loading_state"
          >
            {COLUMNS.map((col) => (
              <div key={col.status} className="space-y-3">
                <Skeleton className="h-8 bg-muted rounded" />
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 bg-muted rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 min-h-96">
            {COLUMNS.map((col) => {
              const colLeads = (leads ?? []).filter(
                (l: Lead) => l.status === col.status,
              );
              const totalValue = colLeads.reduce(
                (s: number, l: Lead) => s + l.dealValue,
                0,
              );
              return (
                <div key={col.status} className="flex flex-col">
                  {/* Column header */}
                  <div
                    className={`flex items-center justify-between mb-3 px-3 py-2 rounded-lg border ${col.bg} bg-card/50`}
                  >
                    <span className={`text-sm font-semibold ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)]">
                    {colLeads.map((lead: Lead, i: number) => (
                      <motion.button
                        key={lead.id.toString()}
                        data-ocid={`pipeline.item.${i + 1}`}
                        whileHover={{ y: -2 }}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="w-full text-left p-3 rounded-lg bg-card border border-border shadow-card hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                            {lead.name[0]}
                          </div>
                          <p className="font-medium text-foreground text-sm truncate">
                            {lead.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {lead.company}
                        </p>
                        <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          {formatCurrency(lead.dealValue)}
                        </div>
                      </motion.button>
                    ))}
                    {colLeads.length === 0 && (
                      <div
                        data-ocid={`pipeline.${col.status}.empty_state`}
                        className="h-16 rounded-lg border border-dashed border-border/50 flex items-center justify-center"
                      >
                        <span className="text-xs text-muted-foreground/50">
                          Empty
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Column footer total */}
                  {colLeads.length > 0 && (
                    <div className="mt-2 px-2 py-1.5 rounded-md bg-muted/20 border border-border/30">
                      <p className="text-xs text-muted-foreground text-center">
                        Total:{" "}
                        <span className="font-semibold text-foreground">
                          {formatCurrency(totalValue)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <LeadDetailSheet
        leadId={selectedLeadId}
        open={selectedLeadId !== null}
        onClose={() => setSelectedLeadId(null)}
      />
    </div>
  );
}
