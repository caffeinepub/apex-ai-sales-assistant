import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  DollarSign,
  Loader2,
  Mail,
  Phone,
  Plus,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { LeadStatus } from "../backend.d";
import {
  useAddNote,
  useLead,
  useSuggestions,
  useUpdateLeadStatus,
} from "../hooks/useQueries";
import { StatusPill } from "./StatusPill";

const statusOptions = [
  { value: LeadStatus.new_, label: "New" },
  { value: LeadStatus.contacted, label: "Contacted" },
  { value: LeadStatus.qualified, label: "Qualified" },
  { value: LeadStatus.proposal, label: "Proposal" },
  { value: LeadStatus.closedWon, label: "Closed Won" },
  { value: LeadStatus.closedLost, label: "Closed Lost" },
];

function formatTs(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Props {
  leadId: bigint | null;
  open: boolean;
  onClose: () => void;
}

export function LeadDetailSheet({ leadId, open, onClose }: Props) {
  const [note, setNote] = useState("");
  const { data: lead, isLoading } = useLead(leadId);
  const { data: suggestions, isLoading: suggestionsLoading } =
    useSuggestions(leadId);
  const addNote = useAddNote();
  const updateStatus = useUpdateLeadStatus();

  const handleAddNote = async () => {
    if (!lead || !note.trim()) return;
    try {
      await addNote.mutateAsync({ leadId: lead.id, noteText: note.trim() });
      setNote("");
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    }
  };

  const handleStatusChange = async (value: string) => {
    if (!lead) return;
    try {
      await updateStatus.mutateAsync({
        leadId: lead.id,
        status: value as LeadStatus,
      });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        data-ocid="lead_detail.sheet"
        className="w-full sm:max-w-xl bg-card border-border p-0 flex flex-col"
      >
        {isLoading || !lead ? (
          <div
            className="flex items-center justify-center h-full"
            data-ocid="lead_detail.loading_state"
          >
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-lg font-semibold text-foreground">
                    {lead.name}
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {lead.company}
                  </p>
                </div>
                <StatusPill status={lead.status} />
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="px-6 py-5 space-y-6">
                {/* Contact Info */}
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Contact Info
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {lead.phone || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{lead.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">
                        ${lead.dealValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </section>

                <Separator className="bg-border" />

                {/* Stage */}
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Pipeline Stage
                  </h3>
                  <Select
                    value={lead.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger
                      data-ocid="lead_detail.select"
                      className="bg-background border-border"
                      disabled={updateStatus.isPending}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </section>

                <Separator className="bg-border" />

                {/* AI Coaching */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      AI Coaching Tips
                    </h3>
                  </div>
                  {suggestionsLoading ? (
                    <div
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                      data-ocid="lead_detail.suggestions.loading_state"
                    >
                      <Loader2 className="w-3 h-3 animate-spin" /> Generating
                      tips...
                    </div>
                  ) : (
                    <AnimatePresence>
                      <div className="space-y-2">
                        {(suggestions ?? []).map((tip, tipIdx) => (
                          <motion.div
                            key={tip}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: tipIdx * 0.08 }}
                            className="flex items-start gap-2 p-3 rounded-md bg-primary/8 border border-primary/15 text-sm text-foreground"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            {tip}
                          </motion.div>
                        ))}
                        {(!suggestions || suggestions.length === 0) && (
                          <p className="text-sm text-muted-foreground">
                            No suggestions available yet.
                          </p>
                        )}
                      </div>
                    </AnimatePresence>
                  )}
                </section>

                <Separator className="bg-border" />

                {/* Notes */}
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Notes & Activity
                  </h3>
                  <div className="space-y-2 mb-4">
                    {lead.notes.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No notes yet.
                      </p>
                    )}
                    {[...lead.notes].reverse().map((n) => (
                      <div
                        key={n.timestamp.toString()}
                        className="p-3 rounded-md bg-muted/30 border border-border"
                      >
                        <p className="text-sm text-foreground">{n.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTs(n.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      data-ocid="lead_detail.textarea"
                      placeholder="Add a note..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="bg-background border-border text-sm resize-none"
                      rows={3}
                    />
                    <Button
                      data-ocid="lead_detail.save_button"
                      onClick={handleAddNote}
                      disabled={!note.trim() || addNote.isPending}
                      size="sm"
                      className="w-full"
                    >
                      {addNote.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                      ) : (
                        <Plus className="w-3 h-3 mr-2" />
                      )}
                      Add Note
                    </Button>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
