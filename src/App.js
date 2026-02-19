import './App.css';
import Galaxy from "./Galaxy";
import BlurText from "./BlurText";
import DecryptedText from "./DecryptedText";
import Intro from "./Intro";
import SplitText from "./SplitText";
import NairaButton from "./NairaButton";

import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

/* ================= LANDING PAGE ================= */

function Landing() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && <Intro onComplete={() => setShowIntro(false)} />}

      <div className="page">
        <section className="hero-network">
          <div className="hero-overlay">
            <div className="hero-content-left">

              <SplitText
                text="CIPHERFLOW"
                tag="h1"
                className="hero-title"
                delay={0.05}
                duration={1.2}
                ease="power4.out"
                from={{ opacity: 0, y: 100 }}
                to={{ opacity: 1, y: 0 }}
              />

              <h2 className="hero-sub">
                Fraud Leaves Patterns. We Decode Them.
              </h2>

              <p className="hero-desc">
                Detect cycles. Smurfing. Layering.
                Visualize hidden financial structures instantly.
              </p>

              <div style={{ marginTop: "40px" }}>
                <NairaButton
                  text="Explore"
                  icon="🚀"
                  onClick={() => navigate("/explore")}
                />
              </div>

            </div>
          </div>
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
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (f && f.name.endsWith(".csv")) {
      setFile(f);
      setFileName(f.name);
    }
  };

  const handleAnalyze = () => {
    if (!file) return;

    setLoading(true);

    const mockResult = {
      total_transactions: 1240,
      suspicious_accounts: 12,
      fraud_cycles_detected: 4,
      smurfing_patterns: 7,
      shell_accounts: 3
    };

    setTimeout(() => {
      setAnalysisResult(mockResult);
      navigate("/results");
    }, 1200);
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

        <label className="file-input-label">
          Browse File
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            hidden
          />
        </label>

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
              <p style={{ marginTop: "20px" }}>Analyzing dataset...</p>
            )}
          </>
        )}

      </div>
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
            text="View Graph"
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
        <div className="results-card">
          <h2>No Data</h2>
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

      <div className="results-card">
        <h2 className="results-title">Transaction Metrics</h2>

        {Object.entries(analysisResult).map(([key, value]) => (
          <p key={key}>
            <strong>{key}:</strong> {value}
          </p>
        ))}

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
        <div className="results-card">
          <h2>No Data</h2>
          <NairaButton text="Go Back" icon="←" onClick={() => navigate("/")} />
        </div>
      </div>
    );
  }

  const {
    total_transactions,
    suspicious_accounts,
    fraud_cycles_detected,
    smurfing_patterns,
    shell_accounts
  } = analysisResult;

  return (
    <div className="results-page">
      <div className="results-background">
        <Galaxy />
      </div>

      <div className="results-card" style={{ maxWidth: "800px", textAlign: "left" }}>
        <h2 className="results-title">Financial Forensics Report</h2>

        <p>
          The dataset contains <strong>{total_transactions}</strong> transactions.
          Structural analysis identified <strong>{suspicious_accounts}</strong> suspicious accounts.
          Cycle detection revealed <strong>{fraud_cycles_detected}</strong> closed-loop patterns.
          Additionally, <strong>{smurfing_patterns}</strong> smurfing patterns and
          <strong> {shell_accounts}</strong> potential shell accounts were detected.
        </p>

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
      <Route path="/results" element={<Results analysisResult={analysisResult} />} />
      <Route path="/graph" element={<GraphView analysisResult={analysisResult} />} />
      <Route path="/summary" element={<Summary analysisResult={analysisResult} />} />
    </Routes>
  );
}