import "../../styles/LandingPage.css";

function BenefitsSection() {
  return (
    <section className="section" id="benefits">
      <h2>Benefits</h2>
      <div className="grid-3">
        <div className="card">
          <h3>Reduce daily stress</h3>
          <p>
            Short, guided practices help you manage anxiety and feel more in
            control of your day.
          </p>
        </div>
        <div className="card">
          <h3>Understand your patterns</h3>
          <p>
            See how your sleep, workload, and emotions are connected through
            simple visual trends.
          </p>
        </div>
        <div className="card">
          <h3>Build healthy habits</h3>
          <p>
            Create routines around journaling, breathing, or reflection and
            keep up with streaks.
          </p>
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;
