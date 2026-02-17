import { Link } from "react-router-dom";
import "../../styles/LandingPage.css";

function LandingNavbar() {
  return (
    <header className="nav">
      <div className="nav-left">
<<<<<<< HEAD
        <span className="logo">MindKare</span>
=======
        <span className="logo">MindCare</span>
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
      </div>
      <nav className="nav-right">
        <a href="#features">Features</a>
        <a href="#plans">Plans</a>
        <a href="#faq">FAQ</a>

        <Link to="/login" className="nav-btn nav-login">
          Login
        </Link>
        <Link to="/register" className="nav-btn nav-signup">
          Sign Up
        </Link>
      </nav>
    </header>
  );
}

export default LandingNavbar;
