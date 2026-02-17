import "../../styles/LandingPage.css";

function PrivacySection() {
  return (
    <section className="section" id="privacy">
      <h2>Privacy & safety first</h2>
      <div className="grid-2">
        <div className="card">
          <p>
            Your entries are personal. We aim to keep them safe with secure
            storage and controlled access. Only you decide what to share.
          </p>
        </div>

        <div className="card">
          <p className="warning">
            MindKare is <strong>not</strong> a replacement for professional
            therapy or emergency services. If you are in crisis or at risk of
            self-harm, please contact your local helpline or emergency number
            immediately.
          </p>
        </div>
      </div>
    </section>
  );
}

export default PrivacySection;
