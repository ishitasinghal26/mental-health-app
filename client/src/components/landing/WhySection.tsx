import "../../styles/LandingPage.css";

function WhySection() {
  return (
    <section className="section" id="why">
      <h2>Because mental health deserves daily care, not just crisis care.</h2>
      <div className="grid-3">
        <div className="card">
          <h3>Understand your emotions</h3>
          <p>
            Simple daily check-ins help you see patterns in your stress,
            happiness, and energy levels.
          </p>
        </div>
        <div className="card">
          <h3>Express without judgement</h3>
          <p>
            Write freely in your journal and let the AI gently summarize how
            you&apos;ve been feeling.
          </p>
        </div>
        <div className="card">
          <h3>Get science-backed tools</h3>
          <p>
            Access CBT-inspired exercises, breathing practices, and grounding
            techniques anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

export default WhySection;
