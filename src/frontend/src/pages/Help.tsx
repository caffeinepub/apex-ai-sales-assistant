import { Book, HelpCircle, MessageSquare, Zap } from "lucide-react";
import { motion } from "motion/react";
import { TopBar } from "../components/TopBar";

const faqs = [
  {
    q: "How does AI coaching work?",
    a: "Our AI analyzes your lead data, conversation history, and sales patterns to generate personalized next-step recommendations for each deal.",
  },
  {
    q: "How do I move a lead through the pipeline?",
    a: "Open any lead from the Leads page or Pipeline view, then use the Stage dropdown in the detail panel to update their status.",
  },
  {
    q: "Who can delete leads?",
    a: "Only administrators can delete leads. Contact your system admin if you need a lead removed.",
  },
  {
    q: "How often are AI suggestions updated?",
    a: "AI suggestions are generated on-demand when you open a lead detail. They factor in the latest notes and pipeline context.",
  },
];

export function HelpPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Help & Support" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Book,
              title: "Documentation",
              desc: "Read the full user guide",
              color: "text-blue-400",
              bg: "bg-blue-500/10 border-blue-500/20",
            },
            {
              icon: MessageSquare,
              title: "Contact Support",
              desc: "Chat with our team",
              color: "text-teal-400",
              bg: "bg-teal-500/10 border-teal-500/20",
            },
            {
              icon: Zap,
              title: "Quick Start",
              desc: "Get up and running in 5 minutes",
              color: "text-amber-400",
              bg: "bg-amber-500/10 border-amber-500/20",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`p-5 rounded-xl border ${card.bg} cursor-pointer hover:scale-[1.02] transition-transform`}
            >
              <card.icon className={`w-6 h-6 ${card.color} mb-3`} />
              <h3 className={`font-semibold ${card.color} mb-1`}>
                {card.title}
              </h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" /> Frequently Asked
            Questions
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, faqIdx) => (
              <div
                key={faq.q}
                data-ocid={`help.faq.item.${faqIdx + 1}`}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <h4 className="text-sm font-semibold text-foreground mb-1.5">
                  {faq.q}
                </h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
