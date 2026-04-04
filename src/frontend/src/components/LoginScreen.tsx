import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

interface LoginScreenProps {
  onLogin: (mobile: string) => void;
}

type Mode = "login" | "register";

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const { actor, isFetching } = useActor();
  const [mode, setMode] = useState<Mode>("login");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!mobile.trim()) {
      setError("Please enter your mobile number.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!actor) {
      setError("Connecting to backend… please try again.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const ok = await actor.registerUser(mobile.trim(), password);
        if (!ok) {
          setError(
            "Registration failed. This mobile number may already be registered.",
          );
          setLoading(false);
          return;
        }
      } else {
        const ok = await actor.loginUser(mobile.trim(), password);
        if (!ok) {
          setError("Invalid mobile number or password.");
          setLoading(false);
          return;
        }
      }

      onLogin(mobile.trim());
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isActorReady = !!actor && !isFetching;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "oklch(var(--navy))" }}
      data-ocid="login.page"
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, oklch(var(--teal)) 0%, transparent 50%), radial-gradient(circle at 70% 80%, oklch(var(--teal)) 0%, transparent 50%)",
        }}
      />

      <Card
        className="w-full max-w-sm relative shadow-2xl border-0"
        style={{ background: "oklch(var(--card))" }}
      >
        <CardHeader className="text-center pb-2">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "oklch(var(--teal))" }}
            >
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-white"
              style={{ background: "oklch(var(--navy))" }}
            >
              ST
            </div>
            <span
              className="font-bold text-lg"
              style={{ color: "oklch(var(--navy))" }}
            >
              SalesTrak
            </span>
          </div>

          <CardTitle
            className="text-lg mt-1"
            style={{ color: "oklch(var(--navy))" }}
          >
            {mode === "register" ? "Create Account" : "Welcome Back"}
          </CardTitle>
          {mode === "register" && (
            <p className="text-xs text-muted-foreground mt-1">
              Register with your mobile number to get started.
            </p>
          )}
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
            {/* Mobile number */}
            <div className="space-y-1.5">
              <Label htmlFor="mobile" className="text-sm font-medium">
                Mobile Number
              </Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="e.g. 9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.slice(0, 15))}
                maxLength={15}
                autoComplete="tel"
                disabled={loading}
                data-ocid="login.input"
                className="text-base"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                disabled={loading}
                data-ocid="login.pin.input"
                className="text-base"
              />
            </div>

            {/* Confirm Password — register mode only */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirm-password"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                  data-ocid="login.confirm_pin.input"
                  className="text-base"
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <p
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2"
                data-ocid="login.error_state"
              >
                {error}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              className="w-full text-white font-semibold"
              style={{ background: "oklch(var(--teal))" }}
              disabled={loading || !isActorReady}
              data-ocid="login.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "register" ? "Registering..." : "Logging in..."}
                </>
              ) : !isActorReady ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : mode === "register" ? (
                "Register"
              ) : (
                "Login"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="text-primary font-medium hover:underline"
                    data-ocid="login.register.link"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-primary font-medium hover:underline"
                    data-ocid="login.signin.link"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
