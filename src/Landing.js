import { useNavigate } from "react-router-dom";
import ScrollReveal from "./ScrollReveal";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="page">

      <section className="section hero">
        <h1 className="hero-title">FOLLOW THE MONEY.</h1>
        <p className="hero-sub">
          Graph-based detection of hidden financial crime networks.
        </p>

        <button
          className="explore-btn"
          onClick={() => navigate("/explore")}
        >
          Explore
        </button>

        <p className="scroll-hint">Scroll to investigate ↓</p>
      </section>

      <section className="section">
        <ScrollReveal>
          Money muling hides illicit funds inside complex transaction networks.
        </ScrollReveal>
      </section>

    </div>
  );
}
