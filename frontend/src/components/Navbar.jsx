import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          <span>🛡️</span> TrapNet
        </NavLink>

        {/* Desktop navigation */}
        <nav className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'navbar-link active' : 'navbar-link'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/predict"
            className={({ isActive }) =>
              isActive ? 'navbar-link active' : 'navbar-link'
            }
          >
            Predict
          </NavLink>
          <NavLink
            to="/train"
            className={({ isActive }) =>
              isActive ? 'navbar-link active' : 'navbar-link'
            }
          >
            Train
          </NavLink>
          <NavLink
            to="/logs"
            className={({ isActive }) =>
              isActive ? 'navbar-link active' : 'navbar-link'
            }
          >
            Logs
          </NavLink>
        </nav>

        {/* Mobile hamburger button */}
        <button
          className="navbar-hamburger"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile navigation dropdown */}
      {isOpen && (
        <nav className="navbar-mobile-menu">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'navbar-link active' : 'navbar-link'
            }
            onClick={closeMenu}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/predict"
            className={({ isActive }) =>
              isActive ? 'navbar-link active' : 'navbar-link'
            }
            onClick={closeMenu}
          >
            Predict
          </NavLink>
          <NavLink
            to="/train"
            className={({ isActive }) =>
              isActive ? 'navbar-link active' : 'navbar-link'
            }
            onClick={closeMenu}
          >
            Train
          </NavLink>
          <NavLink
            to="/logs"
            className={({ isActive }) =>
              isActive ? 'navbar-link active' : 'navbar-link'
            }
            onClick={closeMenu}
          >
            Logs
          </NavLink>
        </nav>
      )}
    </header>
  );
}
