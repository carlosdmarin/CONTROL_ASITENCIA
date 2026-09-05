// app/reportes/page.tsx
"use client";

import { useState } from "react";
import { ReportesHeader } from "./components/ReportesHeader";
import { ReportesTable } from "./components/ReportesTable";





export default function ReportesPage() {



  return (
    <div className="space-y-6 p-6">
      <ReportesHeader />

      <ReportesTable />
      
    </div>
  );
}
