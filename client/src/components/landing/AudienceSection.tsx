import "../../styles/LandingPage.css";

function AudienceSection() {
  return (
    <section className="section" id="audience">
      <h2>Built for everyone</h2>
      <div className="grid-3">
        <div className="card">
          <h3>Students</h3>
          <p>
            Manage exam stress, peer pressure, and life changes with simple
            daily check-ins.
          </p>
        </div>
        <div className="card">
          <h3>Working professionals</h3>
          <p>
            Cope with burnout, workload, and work-life balance through
            structured reflection.
          </p>
        </div>
        <div className="card">
          <h3>Anyone, really</h3>
          <p>
            If you have emotions, this app is for you — no diagnosis labels,
            just support.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AudienceSection;
