import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ZIndexProvider } from "./contexts/ZIndexContext";
import Home from "./pages/Home";
import ConversationPage from "./pages/ConversationPage";
import EmptyPage from "./pages/EmptyPage";
import AgentsPage from "./pages/AgentsPage";
import ChatControlBoxTest from "./pages/ChatControlBoxTest";

/**
 * Application Router
 * Defines all routes for the Multi-AI Chat application.
 * The catch-all route at the end handles all unmatched paths (404).
 */
function Router() {
  return (
    <Switch>
      {/* Main application routes */}
      <Route path="/" component={EmptyPage} />
      <Route path="/chat" component={EmptyPage} />
      <Route path="/conversation" component={ConversationPage} />
      <Route path="/agents" component={AgentsPage} />
      <Route path="/home" component={Home} />
      <Route path="/test/chat-control-box" component={ChatControlBoxTest} />
      
      {/* Catch-all route for 404 - handles all unmatched paths */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Root Application Component
 * Wraps the entire app with necessary providers:
 * - ErrorBoundary: Catches and displays React errors gracefully
 * - ThemeProvider: Manages dark/light theme state (switchable=true enables user control)
 * - TooltipProvider: Enables tooltips throughout the app
 * - Toaster: Provides toast notifications
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={true}>
        <ZIndexProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ZIndexProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
