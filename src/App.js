import './App.css';
import Galaxy from "./Galaxy";
import BlurText from "./BlurText";
import DecryptedText from "./DecryptedText";
import AppResults from "./App.jsx";
import { Routes, Route, useNavigate } from "react-router-dom";
import ScrollReveal from './ScrollReveal';
import NairaButton from "./NairaButton";
import { useState, useEffect } from "react";

/* ================= LANDING PAGE ================= */

function Landing() {
  const navigate = useNavigate();

  return (
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
  );
}

/* ================= UPLOAD PAGE ================= */

function Upload() {
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.name.endsWith(".csv")) {
      setFileName(f.name);
      setFile(f);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (f && f.name.endsWith(".csv")) {
      setFileName(f.name);
      setFile(f);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    navigate("/loading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8023/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Analysis failed");

      const result = await res.json();

      navigate("/results", { state: { result } });
    } catch (err) {
      alert(err.message);
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
          CSV must contain sender_id, receiver_id, amount, timestamp.
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
            <NairaButton text="Analyze" icon="🔍" onClick={handleAnalyze} />
          </>
        )}
      </div>
    </div>
  );
}

/* ================= LOADING PAGE ================= */

function Loading() {
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

      <div className="loader-box">
        <h2>
          <DecryptedText
            text="Analyzing Financial Network..."
            animateOn="view"
            revealDirection="start"
            sequential
            speed={60}
            className="loader-decrypted"
          />
        </h2>
      </div>
    </div>
  );
}

/* ================= ROUTING ================= */

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/explore" element={<Upload />} />
      <Route path="/loading" element={<Loading />} />
      <Route path="/results" element={<AppResults />} />
    </Routes>
  );
}

/* ================= RESULTS WRAPPER ================= */
