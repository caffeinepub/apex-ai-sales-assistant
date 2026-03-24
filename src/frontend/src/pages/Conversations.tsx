import { MessageSquare, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Lead } from "../backend.d";
import { LeadDetailSheet } from "../components/LeadDetailSheet";
import { TopBar } from "../components/TopBar";
import { useLeads } from "../hooks/useQueries";

export function ConversationsPage() {
  const { data: leads } = useLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<bigint | null>(null);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Conversations" />
      <div className="flex-1 overflow-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-1 gap-3 max-w-2xl">
            {(leads ?? []).slice(0, 8).map((lead: Lead, i: number) => (
              <button
                type="button"
                key={lead.id.toString()}
                data-ocid={`conversations.item.${i + 1}`}
                onClick={() => setSelectedLeadId(lead.id)}
                className="w-full flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                  {lead.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-foreground text-sm">
                      {lead.name}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      · {lead.company}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {lead.notes.length > 0
                      ? lead.notes[lead.notes.length - 1].text
                      : "No messages yet. Click to start coaching conversation."}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary">
                  <Sparkles className="w-3 h-3" />
                  AI
                </div>
              </button>
            ))}
            {(leads ?? []).length === 0 && (
              <div
                className="flex flex-col items-center justify-center py-20 text-center"
                data-ocid="conversations.empty_state"
              >
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No conversations yet.</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Create a lead to start coaching conversations.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <LeadDetailSheet
        leadId={selectedLeadId}
        open={selectedLeadId !== null}
        onClose={() => setSelectedLeadId(null)}
      />
    </div>
  );
}
