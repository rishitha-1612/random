import './App.css';
import Galaxy from "./Galaxy";
import BlurText from "./BlurText";
import DecryptedText from "./DecryptedText";
import Intro from "./Intro";

import { Routes, Route, useNavigate } from "react-router-dom";
import ScrollReveal from './ScrollReveal';
import NairaButton from "./NairaButton";
import { useState, useEffect } from "react";

/* ================= LANDING PAGE ================= */

function Landing() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && <Intro onComplete={() => setShowIntro(false)} />}

      <div className="page">

        <div className="page-background">
          <Galaxy />
        </div>

        <section className="section hero">
          <div className="hero-content">

            <h1 className="hero-title">FOLLOW THE MONEY.</h1>

            <p className="hero-sub">
              Graph-Based Detection of Hidden Financial Crime Networks.
            </p>

            <p className="hero-desc">
              Money muling operations hide illicit funds through multi-hop
              transaction chains, circular routing, and shell accounts.
              Traditional rule-based systems fail to detect these patterns.
              <br /><br />
              Our Financial Forensics Engine transforms transaction data
              into graph structures and exposes hidden fraud rings
              using advanced pattern detection.
            </p>

            <p className="scroll-hint">Scroll to investigate ↓</p>

          </div>
        </section>

        <section className="section content-section">
          <ScrollReveal>
            Criminal networks exploit layered transaction flows
            to obscure the origin of illicit funds.
          </ScrollReveal>
          <ScrollReveal>
            Circular fund routing. Smurfing aggregation. Shell chains.
          </ScrollReveal>
          <ScrollReveal>
            We make invisible financial patterns visible.
          </ScrollReveal>
        </section>

        <section className="section final">
          <ScrollReveal>Financial crime leaves patterns.</ScrollReveal>
          <ScrollReveal>We detect them.</ScrollReveal>
          <NairaButton
            text="Explore"
            icon="🚀"
            onClick={() => navigate("/explore")}
          />
        </section>

      </div>
    </>
  );
}

/* ================= UPLOAD PAGE ================= */

function Upload({ setAnalysisResult }) {
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.name.endsWith(".csv")) {
      setFile(f);
      setFileName(f.name);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (f && f.name.endsWith(".csv")) {
      setFile(f);
      setFileName(f.name);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/analyze/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const json = await res.json();
      console.log("BACKEND RESPONSE:", json);
      setAnalysisResult(json);
      navigate("/results");

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setError("Failed to connect to backend. Is Flask running on port 5000?");
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">

      <div className="upload-background">
        <Galaxy />
      </div>

      <div className="upload-content">

        <BlurText
          text="Upload Transaction Dataset"
          delay={120}
          animateBy="words"
          direction="top"
          className="upload-title"
        />

        <p className="upload-sub">
          CSV must contain transaction_id, sender_id, receiver_id, amount, timestamp.
        </p>

        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <BlurText
            text="Drag & Drop CSV File Here"
            delay={100}
            animateBy="words"
            direction="top"
            className="drop-zone-text"
          />

          <p className="drop-zone-or">or</p>

          <label className="file-input-label">
            <BlurText
              text="Browse File"
              delay={80}
              animateBy="words"
              direction="top"
              className="browse-text"
            />
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              hidden
            />
          </label>
        </div>

        {fileName && (
          <>
            <p className="file-name">Selected File: {fileName}</p>
            {!loading ? (
              <NairaButton
                text="Analyze"
                icon="🔍"
                onClick={handleAnalyze}
              />
            ) : (
              <p style={{ opacity: 0.7, marginTop: "20px" }}>Uploading to backend...</p>
            )}
          </>
        )}

        {error && (
          <p style={{ color: "#ff5b5b", marginTop: "16px", fontSize: "0.9rem" }}>
            {error}
          </p>
        )}

      </div>

    </div>
  );
}

/* ================= LOADING PAGE ================= */

function Loading() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/results");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="loader-page">

      <div className="truck-container">
        <div className="truck">
          <div className="truck-body">
            <div className="money-stack stack1"></div>
            <div className="money-stack stack2"></div>
            <div className="money-stack stack3"></div>
          </div>
          <div className="truck-cabin">
            <div className="window"></div>
          </div>
          <div className="wheel wheel-left"></div>
          <div className="wheel wheel-right"></div>
        </div>
        <div className="road"></div>
      </div>

      <h2 className="loader-title">
        <DecryptedText
          text="Analyzing Financial Network..."
          animateOn="view"
          revealDirection="start"
          sequential
          speed={60}
        />
      </h2>

      <p className="loader-sub">Detecting fraud rings and suspicious accounts</p>

    </div>
  );
}

/* ================= RESULTS PAGE ================= */

function Results({ analysisResult }) {
  const navigate = useNavigate();

  const downloadJson = () => {
    if (!analysisResult) return;
    const blob = new Blob(
      [JSON.stringify(analysisResult, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analysis_result.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="results-page">

      <div className="results-background">
        <Galaxy />
      </div>

      <div className="results-card">

        <h2 className="results-title">Analysis Complete</h2>

        <p className="results-sub">
          {analysisResult
            ? "Fraud patterns successfully detected within the transaction graph."
            : "No result data. Please upload a file first."}
        </p>

        <div className="results-buttons">
          <NairaButton
            text="View Bar Graph"
            icon="📊"
            onClick={() => navigate("/graph")}
          />
          <NairaButton
            text="View Summary"
            icon="📄"
            onClick={() => navigate("/summary")}
          />
          <NairaButton
            text="Download JSON"
            icon="⬇️"
            onClick={downloadJson}
          />
        </div>

      </div>

    </div>
  );
}

/* ================= GRAPH PAGE ================= */

function GraphView({ analysisResult }) {
  const navigate = useNavigate();

  if (!analysisResult) {
    return (
      <div className="results-page">
        <div className="results-background"><Galaxy /></div>
        <div className="results-card">
          <h2 className="results-title">No Data</h2>
          <p className="results-sub">Please upload a file first.</p>
          <NairaButton text="Go Back" icon="←" onClick={() => navigate("/")} />
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">

      <div className="results-background">
        <Galaxy />
      </div>

      <div className="results-card" style={{ maxWidth: "800px", width: "90%" }}>

        <h2 className="results-title">Transaction Graph</h2>
        <p className="results-sub">Visual breakdown of detected fraud patterns.</p>

        {/* Bar chart using plain divs — replace with your chart library if needed */}
        <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {Object.entries(analysisResult).map(([key, value]) => {
            if (typeof value !== "number") return null;
            return (
              <div key={key} style={{ textAlign: "left" }}>
                <p style={{ margin: "0 0 4px", fontSize: "0.85rem", opacity: 0.7 }}>{key}</p>
                <div style={{
                  height: "24px",
                  width: `${Math.min(100, (value / 100) * 100)}%`,
                  background: "linear-gradient(90deg, #5b8cff, #9f7fff)",
                  borderRadius: "6px",
                  minWidth: "40px",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "8px",
                  fontSize: "0.8rem"
                }}>
                  {value}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "30px" }}>
          <NairaButton text="Go Back" icon="←" onClick={() => navigate("/results")} />
        </div>

      </div>

    </div>
  );
}

/* ================= SUMMARY PAGE ================= */

function Summary({ analysisResult }) {
  const navigate = useNavigate();

  if (!analysisResult) {
    return (
      <div className="results-page">
        <div className="results-background"><Galaxy /></div>
        <div className="results-card">
          <h2 className="results-title">No Data</h2>
          <p className="results-sub">Please upload a file first.</p>
          <NairaButton text="Go Back" icon="←" onClick={() => navigate("/")} />
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">

      <div className="results-background">
        <Galaxy />
      </div>

      <div className="results-card" style={{ maxWidth: "700px", width: "90%" }}>

        <h2 className="results-title">Analysis Summary</h2>
        <p className="results-sub">Detailed breakdown of findings.</p>

        <div style={{ marginTop: "30px", textAlign: "left", display: "flex", flexDirection: "column", gap: "16px" }}>
          {Object.entries(analysisResult).map(([key, value]) => (
            <div key={key} style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "10px",
              padding: "14px 20px",
              borderLeft: "3px solid #5b8cff"
            }}>
              <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.55, textTransform: "uppercase", letterSpacing: "1px" }}>{key}</p>
              <p style={{ margin: "6px 0 0", fontSize: "1rem", fontWeight: 600 }}>
                {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "30px" }}>
          <NairaButton text="Go Back" icon="←" onClick={() => navigate("/results")} />
        </div>

      </div>

    </div>
  );
}

/* ================= ROUTING ================= */

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/explore" element={<Upload setAnalysisResult={setAnalysisResult} />} />
      <Route path="/loading" element={<Loading />} />
      <Route path="/results" element={<Results analysisResult={analysisResult} />} />
      <Route path="/graph" element={<GraphView analysisResult={analysisResult} />} />
      <Route path="/summary" element={<Summary analysisResult={analysisResult} />} />
    </Routes>
  );
}