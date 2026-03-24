import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LeadStatus } from "../backend.d";
import type { Lead } from "../backend.d";
import { TopBar } from "../components/TopBar";
import { useLeads, useStats } from "../hooks/useQueries";

const STATUS_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.new_]: "#3b82f6",
  [LeadStatus.contacted]: "#a855f7",
  [LeadStatus.qualified]: "#2dd4bf",
  [LeadStatus.proposal]: "#f59e0b",
  [LeadStatus.closedWon]: "#22c55e",
  [LeadStatus.closedLost]: "#ef4444",
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.new_]: "New",
  [LeadStatus.contacted]: "Contacted",
  [LeadStatus.qualified]: "Qualified",
  [LeadStatus.proposal]: "Proposal",
  [LeadStatus.closedWon]: "Won",
  [LeadStatus.closedLost]: "Lost",
};

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

const tooltipStyle = {
  backgroundColor: "oklch(0.175 0.035 247)",
  border: "1px solid oklch(0.245 0.040 247)",
  borderRadius: "8px",
  color: "oklch(0.933 0.025 247)",
  fontSize: "12px",
};

export function AnalyticsPage() {
  const { data: leads, isLoading } = useLeads();
  const { data: stats, isLoading: statsLoading } = useStats();

  // By-stage bar data
  const stageData = Object.values(LeadStatus).map((s) => ({
    name: STATUS_LABELS[s],
    count: (leads ?? []).filter((l: Lead) => l.status === s).length,
    value: (leads ?? [])
      .filter((l: Lead) => l.status === s)
      .reduce((a: number, l: Lead) => a + l.dealValue, 0),
    fill: STATUS_COLORS[s],
  }));

  // Win/loss pie
  const winLossData = [
    { name: "Won", value: Number(stats?.closedWon ?? 0), fill: "#22c55e" },
    { name: "Lost", value: Number(stats?.closedLost ?? 0), fill: "#ef4444" },
    { name: "Active", value: Number(stats?.activeDeals ?? 0), fill: "#3b82f6" },
  ];

  // Simulated monthly trend (sample data enriched with real totals)
  const monthlyData = [
    { month: "Sep", leads: 8, value: 45000 },
    { month: "Oct", leads: 12, value: 78000 },
    { month: "Nov", leads: 9, value: 52000 },
    { month: "Dec", leads: 15, value: 95000 },
    { month: "Jan", leads: 11, value: 67000 },
    { month: "Feb", leads: 18, value: 112000 },
    {
      month: "Mar",
      leads: (leads?.length ?? 0) + 3,
      value: stats?.totalPipelineValue ?? 89000,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Analytics" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Pipeline",
              value: statsLoading
                ? "—"
                : formatCurrency(stats?.totalPipelineValue ?? 0),
            },
            {
              label: "Conversion Rate",
              value: statsLoading
                ? "—"
                : `${((stats?.conversionRate ?? 0) * 100).toFixed(1)}%`,
            },
            {
              label: "Deals Won",
              value: statsLoading ? "—" : String(stats?.closedWon ?? 0),
            },
            {
              label: "Deals Lost",
              value: statsLoading ? "—" : String(stats?.closedLost ?? 0),
            },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-4 rounded-xl bg-card border border-border"
            >
              <p className="text-xs text-muted-foreground mb-2">{kpi.label}</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <p className="text-2xl font-bold text-foreground">
                  {kpi.value}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pipeline by Stage */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-xl bg-card border border-border"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Pipeline Value by Stage
            </h3>
            {isLoading ? (
              <Skeleton className="h-48 bg-muted rounded" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stageData} barSize={28}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.245 0.040 247 / 0.4)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "oklch(0.687 0.040 247)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.687 0.040 247)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatCurrency(v)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "oklch(0.245 0.040 247 / 0.3)" }}
                    formatter={(v: number) => [formatCurrency(v), "Value"]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {stageData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Win/Loss Pie */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-5 rounded-xl bg-card border border-border"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Deal Distribution
            </h3>
            {statsLoading ? (
              <Skeleton className="h-48 bg-muted rounded" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {winLossData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span
                        style={{
                          color: "oklch(0.687 0.040 247)",
                          fontSize: 12,
                        }}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-xl bg-card border border-border"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Leads Over Time
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.245 0.040 247 / 0.4)"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "oklch(0.687 0.040 247)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.687 0.040 247)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
