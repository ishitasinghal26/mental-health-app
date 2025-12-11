import { Link } from "react-router-dom";
import "../../styles/LandingPage.css";

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>Your AI-powered mental wellness companion</h1>
        <p>
          Track your mood, journal your thoughts, and get gentle AI support —
          all in one secure place.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="primary-btn">
            Get started free
          </Link>
          <a href="#features" className="secondary-btn">
            Explore features
          </a>
        </div>

        <p className="hero-note">
          No credit card required · Not a medical service · Your data stays
          private
        </p>
      </div>

      <div className="hero-card">
        <h3>Today’s snapshot</h3>
        <p>Mood: 🙂 Calm</p>
        <p>Streak: 5 days</p>
        <p>Suggested: 5-min breathing + gratitude journal</p>
      </div>
    </section>
  );
}

export default HeroSection;
