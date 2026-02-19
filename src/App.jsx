import { useLocation } from "react-router-dom";
import { useState } from "react";
import GraphView from "./GraphView";
import NairaButton from "./NairaButton";

export default function AppResults() {
  const { state } = useLocation();
  const report = state?.result;

  const [view, setView] = useState(null); // "summary" | "graph"

  if (!report) {
    return <p style={{ color: "white" }}>No analysis data available.</p>;
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rift-analysis.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      {/* ===== RESULT OPTIONS (UI UNCHANGED) ===== */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <NairaButton
          text="Summary"
          icon="📄"
          onClick={() => setView("summary")}
        />
        <NairaButton
          text="View Graph"
          icon="🕸️"
          onClick={() => setView("graph")}
        />
        <NairaButton
          text="Download JSON"
          icon="⬇️"
          onClick={downloadJSON}
        />
      </div>

      {/* ===== SUMMARY VIEW ===== */}
      {view === "summary" && (
        <div>
          <h2>Analysis Summary</h2>
          <p>Total Accounts: {report.summary.total_accounts_analyzed}</p>
          <p>Suspicious Accounts: {report.summary.suspicious_accounts_flagged}</p>
          <p>Fraud Rings: {report.summary.fraud_rings_detected}</p>
          <p>Processing Time: {report.summary.processing_time_seconds}s</p>
        </div>
      )}

      {/* ===== GRAPH VIEW (FIXED HEIGHT – THIS WAS THE ISSUE) ===== */}
      {view === "graph" && (
        <div style={{ width: "100%", height: "80vh" }}>
          <GraphView report={report} />
        </div>
      )}

      {!view && (
        <p style={{ opacity: 0.7 }}>
          Select an option to explore the analysis results.
        </p>
      )}
    </div>
  );
}
