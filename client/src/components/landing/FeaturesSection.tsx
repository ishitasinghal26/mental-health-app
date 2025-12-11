import "../../styles/LandingPage.css";

function FeaturesSection() {
  return (
    <section className="section" id="features">
      <h2>Features</h2>
      <p className="section-subtitle">
        Everything you need for daily mental wellness in one place.
      </p>

      <div className="grid-3">
        <div className="card">
          <h3>Mood Tracking</h3>
          <p>Track your daily mood and view patterns over time.</p>
        </div>

        <div className="card">
          <h3>Smart Journaling</h3>
          <p>Journal freely and let AI summarize your emotions.</p>
        </div>

        <div className="card">
          <h3>AI Wellness Chatbot</h3>
          <p>
            A friendly AI companion that listens and gently guides you through
            stress.
          </p>
        </div>

        <div className="card">
          <h3>Self-Help Tools</h3>
          <p>Breathing exercises, grounding techniques & CBT worksheets.</p>
        </div>

        <div className="card">
          <h3>Personalized Insights</h3>
          <p>AI identifies stress patterns and suggests routines.</p>
        </div>

        <div className="card">
          <h3>Crisis Support Layer</h3>
          <p>Quick access to emergency helplines when needed.</p>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
