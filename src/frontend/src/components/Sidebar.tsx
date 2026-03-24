import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  GitMerge,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Leads", icon: Users, to: "/leads" },
  { label: "Conversations", icon: MessageSquare, to: "/conversations" },
  { label: "Pipeline", icon: GitMerge, to: "/pipeline" },
  { label: "Analytics", icon: BarChart2, to: "/analytics" },
  { label: "Coaching", icon: BookOpen, to: "/coaching" },
];

const bottomItems = [
  { label: "Settings", icon: Settings, to: "/settings" },
  { label: "Help", icon: HelpCircle, to: "/help" },
];

function NavItem({
  label,
  icon: Icon,
  to,
}: { label: string; icon: React.ElementType; to: string }) {
  const router = useRouterState();
  const isActive =
    to === "/"
      ? router.location.pathname === "/"
      : router.location.pathname.startsWith(to);

  return (
    <Link to={to} data-ocid={`nav.${label.toLowerCase()}.link`}>
      <motion.div
        whileHover={{ x: 2 }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
          isActive
            ? "bg-primary/15 text-primary border border-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {label}
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </motion.div>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col bg-sidebar border-r border-sidebar-border z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-glow">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-foreground font-bold text-base tracking-tight">
          SalesPro AI
        </span>
      </div>

      {/* Main nav */}
      <nav
        className="flex-1 px-3 py-4 space-y-0.5"
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t border-sidebar-border space-y-0.5">
        {bottomItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </aside>
  );
}
