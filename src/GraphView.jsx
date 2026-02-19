import React from "react";
import ForceGraph2D from "react-force-graph-2d";

export default function GraphView({ report }) {
  const nodesMap = {};
  const links = [];

  const suspiciousIds = report.suspicious_accounts.map(
    acc => acc.account_id
  );

  // 🧠 Build nodes + links
  report.fraud_rings.forEach(ring => {
    const members = ring.member_accounts;

    // Create nodes
    members.forEach(acc => {
      if (!nodesMap[acc]) {
        nodesMap[acc] = {
          id: acc,
          ring_id: ring.ring_id,
          pattern_type: ring.pattern_type
        };
      }
    });

    // 🔁 CYCLE
    if (ring.pattern_type === "cycle") {
      for (let i = 0; i < members.length; i++) {
        links.push({
          source: members[i],
          target: members[(i + 1) % members.length],
          pattern_type: "cycle"
        });
      }
    }

    // 🐜 SMURFING (auto-detect fan-in or fan-out)
    if (ring.pattern_type === "smurfing") {

      // 🔥 If FIRST member is suspicious → Fan-Out (1 → many)
      if (suspiciousIds.includes(members[0])) {

        const master = members[0];

        members.slice(1).forEach(member => {
          links.push({
            source: master,
            target: member,
            pattern_type: "smurfing"
          });
        });

      } else {
        // 🔥 Otherwise → Fan-In (many → 1)
        const aggregator = members[members.length - 1];

        members.slice(0, -1).forEach(member => {
          links.push({
            source: member,
            target: aggregator,
            pattern_type: "smurfing"
          });
        });
      }
    }

    // 🟣 LAYERED SHELL (chain)
    if (ring.pattern_type === "layered_shell") {
      for (let i = 0; i < members.length - 1; i++) {
        links.push({
          source: members[i],
          target: members[i + 1],
          pattern_type: "layered_shell"
        });
      }
    }

    // 🔴 ML anomaly → no edges
  });

  // Attach suspicion score info
  report.suspicious_accounts.forEach(acc => {
    if (nodesMap[acc.account_id]) {
      nodesMap[acc.account_id].suspicion_score = acc.suspicion_score;
      nodesMap[acc.account_id].detected_patterns = acc.detected_patterns;
    }
  });

  const graphData = {
    nodes: Object.values(nodesMap),
    links
  };

  return (
    <div style={{ height: "100vh", background: "#111", position: "relative" }}>
      <ForceGraph2D
        graphData={graphData}

        // 🔥 Direction arrows
        linkDirectionalArrowLength={14}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={() => "white"}

        // 🔥 Direction animation
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={4}

        linkWidth={2}

        // 🎨 Link Colors
        linkColor={link => {
          switch (link.pattern_type) {
            case "cycle":
              return "#ff8c00"; // orange
            case "smurfing":
              return "#ffff00"; // yellow
            case "layered_shell":
              return "#9b59b6"; // purple
            default:
              return "#888";
          }
        }}

        // 🎨 Node styling
        nodeCanvasObject={(node, ctx) => {
          let color = "#3498db";
          let size = 8;

          switch (node.pattern_type) {
            case "cycle":
              color = "#ff8c00";
              size = 10;
              break;
            case "smurfing":
              color = "#ffff00";
              size = 9;
              break;
            case "layered_shell":
              color = "#9b59b6";
              size = 10;
              break;
            case "ml_anomaly":
              color = "#ff0000";
              size = 12;
              break;
            default:
              color = "#3498db";
          }

          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}

        nodeLabel={node =>
          `Account: ${node.id}
Ring: ${node.ring_id}
Pattern: ${node.pattern_type}
Score: ${node.suspicion_score || "N/A"}`
        }

        cooldownTicks={100}
      />

      {/* LEGEND */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "#222",
          padding: "12px",
          borderRadius: "8px",
          color: "white",
          fontSize: "14px"
        }}
      >
        <div>🟠 Cycle</div>
        <div>🟡 Smurfing (Fan-In / Fan-Out)</div>
        <div>🟣 Layered Shell</div>
        <div>🔴 ML Anomaly</div>
      </div>
    </div>
  );
}