import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { LeadStatus } from "../backend.d";
import type { Lead } from "../backend.d";
import { LeadDetailSheet } from "../components/LeadDetailSheet";
import { NewLeadModal } from "../components/NewLeadModal";
import { StatusPill } from "../components/StatusPill";
import { TopBar } from "../components/TopBar";
import { useDeleteLead, useIsAdmin, useLeads } from "../hooks/useQueries";

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function LeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<bigint | null>(null);
  const { data: leads, isLoading } = useLeads();
  const { data: isAdmin } = useIsAdmin();
  const deleteLead = useDeleteLead();

  const filtered = (leads ?? []).filter((l: Lead) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    if (!confirm(`Delete lead "${lead.name}"?`)) return;
    try {
      await deleteLead.mutateAsync(lead.id);
      toast.success("Lead deleted");
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Leads" />
      <div className="flex-1 overflow-auto p-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="leads.search_input"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              data-ocid="leads.status.select"
              className="w-40 bg-card border-border"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value={LeadStatus.new_}>New</SelectItem>
              <SelectItem value={LeadStatus.contacted}>Contacted</SelectItem>
              <SelectItem value={LeadStatus.qualified}>Qualified</SelectItem>
              <SelectItem value={LeadStatus.proposal}>Proposal</SelectItem>
              <SelectItem value={LeadStatus.closedWon}>Closed Won</SelectItem>
              <SelectItem value={LeadStatus.closedLost}>Closed Lost</SelectItem>
            </SelectContent>
          </Select>
          <Button
            data-ocid="leads.new_lead.open_modal_button"
            onClick={() => setNewLeadOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> New Lead
          </Button>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-card border border-border shadow-card overflow-hidden"
        >
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="leads.loading_state">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Company
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Deal Value
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead: Lead, i: number) => (
                    <tr
                      key={lead.id.toString()}
                      data-ocid={`leads.item.${i + 1}`}
                      onClick={() => setSelectedLeadId(lead.id)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setSelectedLeadId(lead.id)
                      }
                      tabIndex={0}
                      className="border-b border-border/40 hover:bg-accent/40 transition-colors cursor-pointer last:border-0"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                            {lead.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {lead.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lead.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {lead.company}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusPill status={lead.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                        {formatCurrency(lead.dealValue)}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {formatDate(lead.updatedAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        {isAdmin && (
                          <Button
                            data-ocid={`leads.delete_button.${i + 1}`}
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-muted-foreground hover:text-destructive"
                            onClick={(e) => handleDelete(e, lead)}
                            disabled={deleteLead.isPending}
                          >
                            {deleteLead.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-muted-foreground"
                        data-ocid="leads.empty_state"
                      >
                        {search || statusFilter !== "all"
                          ? "No leads match your filters."
                          : "No leads yet. Create your first!"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      <NewLeadModal open={newLeadOpen} onClose={() => setNewLeadOpen(false)} />
      <LeadDetailSheet
        leadId={selectedLeadId}
        open={selectedLeadId !== null}
        onClose={() => setSelectedLeadId(null)}
      />
    </div>
  );
}
