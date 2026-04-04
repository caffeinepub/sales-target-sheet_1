import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import LoginScreen from "./components/LoginScreen";
import PlanPage from "./components/PlanPage";
import PratikSoniPage from "./components/PratikSoniPage";
import TargetPageWrapper from "./components/TargetPageWrapper";
import TopNav from "./components/TopNav";
import { useActor } from "./hooks/useActor";
import { SettingsProvider } from "./hooks/useSettings";
import { UserProvider } from "./hooks/useUser";

interface Session {
  loggedIn: boolean;
  mobile: string | null;
}

function readSession(): Session {
  try {
    const raw = localStorage.getItem("auth_session");
    if (!raw) return { loggedIn: false, mobile: null };
    const parsed = JSON.parse(raw);
    if (parsed?.loggedIn === true) {
      return { loggedIn: true, mobile: parsed.mobile ?? null };
    }
    return { loggedIn: false, mobile: null };
  } catch {
    return { loggedIn: false, mobile: null };
  }
}

function AppInner({
  mobile,
  onLogout,
}: {
  mobile: string;
  onLogout: () => void;
}) {
  return (
    <UserProvider mobile={mobile}>
      <SettingsProvider mobile={mobile}>
        <div className="min-h-screen bg-background flex flex-col">
          <TopNav mobile={mobile} onLogout={onLogout} />
          <main className="flex-1 px-4 py-6 md:px-8">
            <Tabs defaultValue="target" className="max-w-5xl mx-auto">
              <TabsList className="mb-6 w-full sm:w-auto" data-ocid="app.tabs">
                <TabsTrigger value="target" data-ocid="app.target.tab">
                  Target
                </TabsTrigger>
                <TabsTrigger value="plan" data-ocid="app.plan.tab">
                  Plan
                </TabsTrigger>
                <TabsTrigger value="pratik-soni" data-ocid="app.settings.tab">
                  PRATIK SONI
                </TabsTrigger>
              </TabsList>

              <TabsContent value="target">
                <TargetPageWrapper />
              </TabsContent>

              <TabsContent value="plan">
                <PlanPage />
              </TabsContent>

              <TabsContent value="pratik-soni">
                <PratikSoniPage mobile={mobile} />
              </TabsContent>
            </Tabs>
          </main>
          <footer className="text-center py-4 text-sm text-muted-foreground border-t border-border">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:underline"
            >
              caffeine.ai
            </a>
          </footer>
          <Toaster richColors position="top-right" />
        </div>
      </SettingsProvider>
    </UserProvider>
  );
}

function AuthGate() {
  const { actor, isFetching } = useActor();
  const [session, setSession] = useState<Session>(readSession);

  const handleLogin = (mobile: string) => {
    const newSession: Session = { loggedIn: true, mobile };
    localStorage.setItem("auth_session", JSON.stringify(newSession));
    setSession(newSession);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_session");
    setSession({ loggedIn: false, mobile: null });
  };

  if (isFetching || (!actor && !session.loggedIn)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(var(--navy))" }}
        data-ocid="login.loading_state"
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg"
            style={{ background: "oklch(var(--teal))" }}
          >
            ST
          </div>
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading SalesTrak...</p>
        </div>
      </div>
    );
  }

  if (!session.loggedIn || !session.mobile) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <AppInner mobile={session.mobile} onLogout={handleLogout} />;
}

export default function App() {
  return <AuthGate />;
}
