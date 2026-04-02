import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import TargetsPage from "./components/TargetsPage";
import TopNav from "./components/TopNav";

export default function App() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <main className="flex-1 px-4 py-8 md:px-8">
        <TargetsPage
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
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
  );
}
