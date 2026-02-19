import React from "react";
import ForceGraph2D from "react-force-graph-2d";

export default function GraphView({ report }) {
  if (!report || !report.rings) {
    return <p>No graph data available</p>;
  }

  const nodesMap = {};
  const links = [];

  // -----------------------------
  // Build nodes + links from backend JSON
  // -----------------------------
  Object.entries(report.rings).forEach(([ringId, ring]) => {
    const members = ring.members;
    const pattern = ring.pattern_type;

    // Create nodes
    members.forEach(acc => {
      if (!nodesMap[acc]) {
        nodesMap[acc] = {
          id: acc,
          ring_id: ringId,
          pattern_type: pattern
        };
      }
    });

    // 🔁 CYCLE
    if (pattern === "cycle") {
      for (let i = 0; i < members.length; i++) {
        links.push({
          source: members[i],
          target: members[(i + 1) % members.length],
          pattern_type: "cycle"
        });
      }
    }

    // 🟡 FAN-IN (many → one)
    if (pattern === "fan_in" && members.length > 1) {
      const hub = members[members.length - 1];
      members.slice(0, -1).forEach(m => {
        links.push({
          source: m,
          target: hub,
          pattern_type: "smurfing"
        });
      });
    }

    // 🟡 FAN-OUT (one → many)
    if (pattern === "fan_out" && members.length > 1) {
      const hub = members[0];
      members.slice(1).forEach(m => {
        links.push({
          source: hub,
          target: m,
          pattern_type: "smurfing"
        });
      });
    }

    // 🟣 SHELL LAYERING (chain)
    if (pattern === "shell_layering") {
      for (let i = 0; i < members.length - 1; i++) {
        links.push({
          source: members[i],
          target: members[i + 1],
          pattern_type: "layered_shell"
        });
      }
    }
  });

  const graphData = {
    nodes: Object.values(nodesMap),
    links
  };

  console.log("GRAPH DATA:", graphData);

  return (
    <div style={{ height: "100vh", background: "#111" }}>
      <ForceGraph2D
        graphData={graphData}

        /* 🔥 DIRECTION */
        linkDirectionalArrowLength={14}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={() => "white"}

        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={4}

        linkWidth={2}

        /* 🎨 LINK COLORS */
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

        /* 🎨 NODE STYLING */
        nodeCanvasObject={(node, ctx) => {
          let color = "#3498db";
          let size = 8;

          switch (node.pattern_type) {
            case "cycle":
              color = "#ff8c00";
              size = 10;
              break;
            case "fan_in":
            case "fan_out":
              color = "#ffff00";
              size = 9;
              break;
            case "shell_layering":
              color = "#9b59b6";
              size = 10;
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
Pattern: ${node.pattern_type}`
        }

        cooldownTicks={120}
      />
    </div>
  );
}
