import "../../styles/LandingPage.css";

function FAQSection() {
  return (
    <section className="section" id="faq">
      <h2>FAQ</h2>
      <div className="faq">
        <div className="faq-item card">
          <h3>Is this a replacement for therapy?</h3>
          <p>
            No. This app is a companion for self-awareness and daily mental
            wellness, not a medical or therapeutic service.
          </p>
        </div>

        <div className="faq-item card">
          <h3>Is it really free?</h3>
          <p>
            Yes, the core features like mood tracking, basic journaling, and
            limited AI chat will be free for users.
          </p>
        </div>

        <div className="faq-item card">
          <h3>Is my data safe?</h3>
          <p>
            We plan to use secure authentication and encrypted storage. In the
            project report, we will highlight how privacy is handled.
          </p>
        </div>

        <div className="faq-item card">
          <h3>Can all age groups use this?</h3>
          <p>
            The app is designed for students, working professionals, and other
            adults. Teen and child modes can be added with simplified content
            and parental guidance.
          </p>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
