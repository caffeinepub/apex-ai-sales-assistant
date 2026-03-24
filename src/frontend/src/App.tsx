import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Sidebar } from "./components/Sidebar";
import { AnalyticsPage } from "./pages/Analytics";
import { CoachingPage } from "./pages/Coaching";
import { ConversationsPage } from "./pages/Conversations";
import { DashboardPage } from "./pages/Dashboard";
import { HelpPage } from "./pages/Help";
import { LeadsPage } from "./pages/Leads";
import { PipelinePage } from "./pages/Pipeline";
import { SettingsPage } from "./pages/Settings";

const rootRoute = createRootRoute({
  component: () => (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col ml-60 overflow-hidden">
        <Outlet />
      </main>
      <Toaster richColors theme="dark" position="top-right" />
      <footer className="fixed bottom-0 right-0 z-10 px-4 py-1.5 text-[10px] text-muted-foreground/40">
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});
const leadsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leads",
  component: LeadsPage,
});
const pipelineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pipeline",
  component: PipelinePage,
});
const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AnalyticsPage,
});
const conversationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/conversations",
  component: ConversationsPage,
});
const coachingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/coaching",
  component: CoachingPage,
});
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});
const helpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/help",
  component: HelpPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  leadsRoute,
  pipelineRoute,
  analyticsRoute,
  conversationsRoute,
  coachingRoute,
  settingsRoute,
  helpRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
