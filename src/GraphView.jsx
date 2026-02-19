import ForceGraph2D from "react-force-graph-2d";
import { useMemo } from "react";

export default function GraphView({ report }) {
  const graphData = useMemo(() => {
    const nodes = [];
    const links = [];
    const seen = new Set();

    const cycleRegex = /^CYC_(\d+)_(\d+)$/;
    const mlRegex = /^LEG_(\d+)$/;

    /* ========= CYCLE RINGS ========= */
    report.fraud_rings.forEach((ring) => {
      const parsed = [];

      ring.member_accounts.forEach((acct) => {
        const match = acct.match(cycleRegex);
        if (!match) return;

        const pos = Number(match[2]);

        if (!seen.has(acct)) {
          nodes.push({
            id: acct,
            anomaly: "cycle",
            color: "#e74c3c", // 🔴 cycle laundering
          });
          seen.add(acct);
        }

        parsed.push({ id: acct, pos });
      });

      parsed.sort((a, b) => a.pos - b.pos);

      // Directed cycle edges
      for (let i = 0; i < parsed.length; i++) {
        links.push({
          source: parsed[i].id,
          target: parsed[(i + 1) % parsed.length].id,
          anomaly: "cycle",
        });
      }
    });

    /* ========= ML ANOMALIES ========= */
    report.suspicious_accounts.forEach((acct) => {
      if (
        acct.detected_patterns.includes("ml_anomaly") &&
        acct.account_id.match(mlRegex)
      ) {
        if (!seen.has(acct.account_id)) {
          nodes.push({
            id: acct.account_id,
            anomaly: "ml",
            color: "#3498db", // 🔵 ML anomaly
          });
          seen.add(acct.account_id);
        }
      }
    });

    return { nodes, links };
  }, [report]);

  return (
    <ForceGraph2D
      graphData={graphData}

      /* ===== NODE STYLING ===== */
      nodeColor={(node) => node.color}
      nodeLabel={(node) => `${node.id}\nType: ${node.anomaly}`}

      /* ===== EDGE LINES (PERSISTENT) ===== */
      linkColor={() => "rgba(255,255,255,0.6)"}
      linkWidth={1.5}

      /* ===== DIRECTED ARROWS ===== */
      linkDirectionalArrowLength={8}
      linkDirectionalArrowRelPos={1}
      linkDirectionalArrowColor={() => "#ffffff"}

      /* ===== TRANSACTION FLOW ANIMATION ===== */
      linkDirectionalParticles={2}
      linkDirectionalParticleSpeed={0.006}
      linkDirectionalParticleWidth={2}

      /* ===== VISUAL CLARITY ===== */
      linkCurvature={0.25}
    />
  );
}
