import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

export type NavLink = { to: string; label: string };

const Navbar: React.FC<{ brand: string; links: NavLink[] }> = ({
  brand = "OPTCG",
  links = [],
}) => {
  const { pathname } = useLocation();

  const isActive = (to: string): boolean => {
    if (to === "/") return pathname === "/";
    return pathname.startsWith(to);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          {brand}
        </Link>
        <ul className="navbar-list">
          {links.map((l) => (
            <li key={l.to} className="navbar-item">
              <Link
                to={l.to}
                className={`navbar-link ${isActive(l.to) ? "active" : ""}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
