import { BookOpen, Sparkles, Target, TrendingUp, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { LeadStatus } from "../backend.d";
import type { Lead } from "../backend.d";
import { TopBar } from "../components/TopBar";
import { useLeads, useStats } from "../hooks/useQueries";

const coachingTips = [
  {
    icon: TrendingUp,
    title: "Follow-Up Cadence",
    tip: "Research shows 80% of sales require 5+ follow-ups. Set a consistent 3-day follow-up schedule for all contacted leads.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Target,
    title: "Proposal Timing",
    tip: "Send proposals within 24 hours of a qualified discovery call. Strike while engagement is highest.",
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/20",
  },
  {
    icon: Trophy,
    title: "Closing Technique",
    tip: "Use the assumptive close: 'When would you like to get started?' instead of 'Would you like to proceed?'",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: BookOpen,
    title: "Discovery Questions",
    tip: "Ask 'What's the cost of NOT solving this problem?' to frame your solution's value effectively.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Sparkles,
    title: "AI Personalization",
    tip: "Reference specific pain points from your last conversation at the start of every call for 2x higher engagement.",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
];

export function CoachingPage() {
  const { data: stats } = useStats();
  const { data: leads } = useLeads();
  const score = Math.min(
    100,
    Math.round(
      (stats?.conversionRate ?? 0) * 100 * 1.8 +
        Number(stats?.activeDeals ?? 0) * 3,
    ),
  );
  const atRisk = (leads ?? []).filter(
    (l: Lead) =>
      l.status === LeadStatus.qualified || l.status === LeadStatus.proposal,
  ).length;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="AI Coaching" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-card border border-primary/20 shadow-glow relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          <div className="relative flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{score}</div>
              <div className="text-xs text-muted-foreground mt-1">AI Score</div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Your Sales Performance
              </h3>
              <p className="text-sm text-muted-foreground">
                Based on conversion rate, activity, and pipeline health
              </p>
              <div className="mt-3 h-2 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-teal-500"
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Deals at Risk</p>
              <p className="text-2xl font-bold text-amber-400">{atRisk}</p>
            </div>
          </div>
        </motion.div>

        {/* Tips */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            AI Coaching Playbook
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {coachingTips.map((item, i) => (
              <motion.div
                key={item.title}
                data-ocid={`coaching.tips.item.${i + 1}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className={`p-4 rounded-xl border ${item.bg}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <h4 className={`text-sm font-semibold ${item.color}`}>
                    {item.title}
                  </h4>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {item.tip}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
