import { BarChart3 } from "lucide-react";

export default function TopNav() {
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
        <BarChart3 className="text-white/60 w-5 h-5" />
        <span className="text-white/70 text-sm hidden sm:inline">
          Sales Dashboard
        </span>
      </div>
    </header>
  );
}
