import { Link } from "react-router-dom";
import "../../styles/LandingPage.css";

function PricingSection() {
  return (
    <section className="section" id="plans">
      <h2>Plans</h2>
      <p className="section-subtitle">Start free. Upgrade later if you need more depth.</p>

      <div className="plans">
        <div className="plan-card">
          <h3>Free</h3>
          <p className="plan-price">₹0 / month</p>
          <ul>
            <li>✓ Daily mood tracking</li>
            <li>✓ Basic journaling</li>
            <li>✓ Limited AI chat per day</li>
            <li>✓ Access to core self-help tools</li>
          </ul>
          <Link to="/register" className="primary-btn plan-btn">Get started</Link>
        </div>

        <div className="plan-card plan-card-highlight">
          <h3>Plus</h3>
          <p className="plan-price">Coming soon</p>
          <ul>
            <li>✓ Everything in Free</li>
            <li>✓ Deeper AI insights & reports</li>
            <li>✓ More exercises & routines</li>
            <li>✓ Advanced progress analytics</li>
          </ul>
          <button className="secondary-btn plan-btn" disabled>Not available yet</button>
        </div>

        <div className="plan-card">
          <h3>Therapist</h3>
          <p className="plan-price">For professionals</p>
          <ul>
            <li>✓ Therapist dashboard</li>
            <li>✓ Client mood summaries (with consent)</li>
            <li>✓ Appointment overview</li>
            <li>✓ Designed for future expansion</li>
          </ul>
          <button className="secondary-btn plan-btn" disabled>Coming soon</button>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
