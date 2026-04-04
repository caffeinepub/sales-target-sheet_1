import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { useState } from "react";
import { currentFYStartYear, getFYStartYear } from "../hooks/useQueries";
import MonthlySummaryPage from "./MonthlySummaryPage";
import TargetsPage from "./TargetsPage";
import YearlySummaryPage from "./YearlySummaryPage";

export default function TargetPageWrapper() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedFYStart, setSelectedFYStart] = useState(currentFYStartYear());

  const handleMonthChange = (m: number) => setSelectedMonth(m);
  const handleYearChange = (y: number) => {
    setSelectedYear(y);
    setSelectedFYStart(getFYStartYear(selectedMonth, y));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Target
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track sales targets and achievements across categories
        </p>
      </div>

      <Tabs defaultValue="monthly">
        <TabsList className="mb-6 w-full sm:w-auto" data-ocid="target.tabs">
          <TabsTrigger value="monthly" data-ocid="target.monthly.tab">
            Monthly
          </TabsTrigger>
          <TabsTrigger
            value="monthly-summary"
            data-ocid="target.monthly_summary.tab"
          >
            Monthly Summary
          </TabsTrigger>
          <TabsTrigger
            value="yearly-summary"
            data-ocid="target.yearly_summary.tab"
          >
            Yearly Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <TargetsPage
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
          />
        </TabsContent>
        <TabsContent value="monthly-summary">
          <MonthlySummaryPage
            selectedFYStart={selectedFYStart}
            onFYStartChange={setSelectedFYStart}
          />
        </TabsContent>
        <TabsContent value="yearly-summary">
          <YearlySummaryPage />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
