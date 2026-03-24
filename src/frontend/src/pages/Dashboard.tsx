import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Lead } from "../backend.d";
import { LeadStatus } from "../backend.d";
import { LeadDetailSheet } from "../components/LeadDetailSheet";
import { StatusPill } from "../components/StatusPill";
import { TopBar } from "../components/TopBar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLeads, useStats, useUserProfile } from "../hooks/useQueries";

const STAGE_ORDER = [
  LeadStatus.new_,
  LeadStatus.contacted,
  LeadStatus.qualified,
  LeadStatus.proposal,
  LeadStatus.closedWon,
  LeadStatus.closedLost,
];

const STAGE_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.new_]: "New",
  [LeadStatus.contacted]: "Contacted",
  [LeadStatus.qualified]: "Qualified",
  [LeadStatus.proposal]: "Proposal",
  [LeadStatus.closedWon]: "Won",
  [LeadStatus.closedLost]: "Lost",
};

const STAGE_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.new_]: "bg-blue-500",
  [LeadStatus.contacted]: "bg-purple-500",
  [LeadStatus.qualified]: "bg-teal-500",
  [LeadStatus.proposal]: "bg-amber-500",
  [LeadStatus.closedWon]: "bg-green-500",
  [LeadStatus.closedLost]: "bg-red-500",
};

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function KpiCard({
  title,
  value,
  delta,
  positive,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl bg-card border border-border shadow-card"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div
          className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24 bg-muted" />
      ) : (
        <p className="text-3xl font-bold text-foreground tracking-tight">
          {value}
        </p>
      )}
      {delta && !loading && (
        <div
          className={`flex items-center gap-1 mt-2 text-xs font-medium ${
            positive ? "text-green-400" : "text-red-400"
          }`}
        >
          {positive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {delta}
        </div>
      )}
    </motion.div>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: profile } = useUserProfile();
  const { identity } = useInternetIdentity();
  const [selectedLeadId, setSelectedLeadId] = useState<bigint | null>(null);

  const displayName = profile?.name ?? (identity ? "there" : "Sarah");

  const stageCounts = Object.fromEntries(
    STAGE_ORDER.map((s) => [
      s,
      leads?.filter((l) => l.status === s).length ?? 0,
    ]),
  ) as Record<LeadStatus, number>;
  const totalLeadCount = leads?.length ?? 1;

  const recentLeads = [...(leads ?? [])]
    .sort((a, b) => Number(b.updatedAt - a.updatedAt))
    .slice(0, 5);

  const aiTips = [
    "Follow up with Quantum Dynamics within 24 hours — deal at risk.",
    "TechFlow Inc. opened your proposal email 3 times. Strike now!",
    "Consider a discount offer for Meridian Corp to close before quarter-end.",
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dashboard" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="text-primary">{displayName}!</span>
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Here's what's happening with your sales pipeline today.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            title="Total Leads"
            value={statsLoading ? "—" : String(stats?.totalLeads ?? 0)}
            delta="+12% this month"
            positive
            icon={Users}
            color="bg-blue-500/80"
            loading={statsLoading}
          />
          <KpiCard
            title="Active Deals"
            value={statsLoading ? "—" : String(stats?.activeDeals ?? 0)}
            delta="+3 this week"
            positive
            icon={Target}
            color="bg-purple-500/80"
            loading={statsLoading}
          />
          <KpiCard
            title="Pipeline Value"
            value={
              statsLoading
                ? "—"
                : formatCurrency(stats?.totalPipelineValue ?? 0)
            }
            delta="+8.2% this month"
            positive
            icon={DollarSign}
            color="bg-teal-500/80"
            loading={statsLoading}
          />
          <KpiCard
            title="Conversion Rate"
            value={
              statsLoading
                ? "—"
                : `${((stats?.conversionRate ?? 0) * 100).toFixed(1)}%`
            }
            delta="+2.1% vs last month"
            positive
            icon={TrendingUp}
            color="bg-green-500/80"
            loading={statsLoading}
          />
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-1 p-5 rounded-xl bg-card border border-border shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">
                Recent Activity
              </h3>
            </div>
            {leadsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 bg-muted rounded-md" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {recentLeads.map((lead, i) => (
                  <button
                    type="button"
                    key={lead.id.toString()}
                    data-ocid={`dashboard.activity.item.${i + 1}`}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                      {lead.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {lead.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.company}
                      </p>
                    </div>
                    <StatusPill status={lead.status} />
                  </button>
                ))}
                {recentLeads.length === 0 && (
                  <p
                    className="text-sm text-muted-foreground text-center py-4"
                    data-ocid="dashboard.activity.empty_state"
                  >
                    No activity yet.
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* AI Coaching Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 p-5 rounded-xl bg-card border border-border shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">
                AI Coaching Tips
              </h3>
              <Badge className="ml-auto text-xs bg-primary/20 text-primary border-primary/30">
                Live
              </Badge>
            </div>
            <div className="space-y-3">
              {aiTips.map((tip, i) => (
                <motion.div
                  key={tip}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  data-ocid={`dashboard.tips.item.${i + 1}`}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/8 border border-primary/15"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-foreground leading-snug">{tip}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pipeline Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-1 p-5 rounded-xl bg-card border border-border shadow-card"
          >
            <h3 className="font-semibold text-foreground text-sm mb-4">
              Pipeline Stages
            </h3>
            <div className="space-y-2.5">
              {STAGE_ORDER.slice(0, 5).map((stage) => {
                const count = stageCounts[stage];
                const pct =
                  totalLeadCount > 0 ? (count / totalLeadCount) * 100 : 0;
                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        {STAGE_LABELS[stage]}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          delay: 0.4,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        className={`h-full rounded-full ${STAGE_COLORS[stage]}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Lead Table Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-card border border-border shadow-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm">
              Lead Overview
            </h3>
            <span className="text-xs text-muted-foreground">Top 5 leads</span>
          </div>
          {leadsLoading ? (
            <div
              className="p-5 space-y-3"
              data-ocid="dashboard.leads.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 bg-muted rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Company
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead: Lead, i) => (
                    <tr
                      key={lead.id.toString()}
                      data-ocid={`dashboard.leads.item.${i + 1}`}
                      onClick={() => setSelectedLeadId(lead.id)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setSelectedLeadId(lead.id)
                      }
                      tabIndex={0}
                      className="border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer last:border-0"
                    >
                      <td className="px-5 py-3 font-medium text-foreground">
                        {lead.name}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {lead.company}
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill status={lead.status} />
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-foreground">
                        {formatCurrency(lead.dealValue)}
                      </td>
                    </tr>
                  ))}
                  {recentLeads.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-muted-foreground"
                        data-ocid="dashboard.leads.empty_state"
                      >
                        No leads yet. Create your first lead!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
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
