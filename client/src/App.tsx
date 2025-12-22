import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import ConversationPage from "./pages/ConversationPage";
import EmptyPage from "./pages/EmptyPage";
import AgentsPage from "./pages/AgentsPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={EmptyPage} />
      <Route path={"/chat"} component={ChatPage} />
      <Route path={"/conversation"} component={ConversationPage} />
      <Route path={"/agents"} component={AgentsPage} />
      <Route path={"/home"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
