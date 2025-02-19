import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Navbar() {
  const location = useLocation(); // Joriy sahifani aniqlash

  const getNavLinkClass = (path) => 
    location.pathname === path 
      ? "nav-link text-light fw-bold border-bottom border-light" 
      : "nav-link text-white";

  return (
    <nav className="navbar navbar-expand-lg bg-primary shadow">
      <div className="container">
        <Link className="navbar-brand fw-bold text-white" to="/">DTM Portal</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className={getNavLinkClass("/")} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={getNavLinkClass("/result")} to="/result">Result</Link>
            </li>
            <li className="nav-item">
              <Link className={getNavLinkClass("/dashboard")} to="/dashboard">Dashboard</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
