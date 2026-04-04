import { Button } from "@/components/ui/button";
import { BarChart3, LogOut, User } from "lucide-react";

interface TopNavProps {
  onLogout?: () => void;
  mobile?: string;
}

export default function TopNav({ onLogout, mobile }: TopNavProps) {
  return (
    <header
      className="w-full py-3 px-4 md:px-8 flex items-center justify-between"
      style={{ background: "oklch(var(--navy))" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm text-white"
          style={{ background: "oklch(var(--teal))" }}
        >
          ST
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">
          SalesTrak
        </span>
      </div>

      {/* Center nav */}
      <nav
        className="hidden md:flex items-center gap-6"
        aria-label="Main navigation"
      >
        <span
          data-ocid="nav.targets.link"
          className="text-sm font-medium text-white pb-0.5 border-b-2 cursor-default"
          style={{ borderColor: "oklch(var(--teal))" }}
        >
          Targets
        </span>
      </nav>

      {/* Right */}
      <div className="flex items-center gap-3">
        <BarChart3 className="text-white/60 w-5 h-5 hidden sm:block" />
        {mobile && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: "oklch(var(--teal) / 0.15)" }}
            data-ocid="nav.user.label"
          >
            <User className="w-4 h-4 text-white/80" />
            <div className="flex flex-col leading-none">
              <span className="text-white/50 text-[10px] uppercase tracking-widest font-medium">
                User
              </span>
              <span className="text-white font-semibold text-sm">{mobile}</span>
            </div>
          </div>
        )}
        {onLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 ml-1"
            data-ocid="nav.logout.button"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Logout</span>
          </Button>
        )}
      </div>
    </header>
  );
}
