import { Link } from "react-router-dom";
import "../../styles/LandingPage.css";
import AppLogo from "../common/AppLogo";

function LandingNavbar() {
  return (
    <header className="nav">
      <div className="nav-left">
        <AppLogo height={36} />
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
