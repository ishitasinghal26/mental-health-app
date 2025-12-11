import { Link } from "react-router-dom";
import "../../styles/LandingPage.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <span className="logo">MindCare</span>
          <p>Your daily mental wellness companion, powered by AI.</p>
        </div>

        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#plans">Plans</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="footer-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Sign Up</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MindCare. Final Year Project.</p>
        <p>Not a medical or emergency service.</p>
      </div>
    </footer>
  );
}

export default Footer;
