import { Link } from "react-router-dom";
import "../../styles/LandingPage.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
<<<<<<< HEAD
          <span className="logo">MindKare</span>
=======
          <span className="logo">MindCare</span>
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
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
<<<<<<< HEAD
        <p>© {new Date().getFullYear()} MindKare. Final Year Project.</p>
=======
        <p>© {new Date().getFullYear()} MindCare. Final Year Project.</p>
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
        <p>Not a medical or emergency service.</p>
      </div>
    </footer>
  );
}

export default Footer;
