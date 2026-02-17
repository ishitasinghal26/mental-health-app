import "../../styles/LandingPage.css";

function HowItWorksSection() {
  return (
    <section className="section" id="how-it-works">
      <h2>How it works</h2>
      <div className="steps">
        <div className="step">
          <span className="step-number">1</span>
          <h3>Sign up & set your goals</h3>
          <p>
            Create a free account, choose your age group, and tell us what you
            want to work on — stress, anxiety, sleep, motivation, or something
            else.
          </p>
        </div>

        <div className="step">
          <span className="step-number">2</span>
          <h3>Check in, journal, and explore tools</h3>
          <p>
            Log your mood, write your thoughts, and practice short exercises
            like breathing or grounding.
          </p>
        </div>

        <div className="step">
          <span className="step-number">3</span>
          <h3>Get insights & gentle nudges</h3>
          <p>
            Receive AI-powered insights and suggestions to build healthier
            habits over days and weeks.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
