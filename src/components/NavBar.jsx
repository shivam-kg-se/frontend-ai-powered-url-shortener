import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiHome,
  FiLink2,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSettings,
  FiSun,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useStoreContext } from "../contextApi/ContextValue";
import { useTheme } from "../contextApi/ThemeContextValue";

const APP_LINKS = [
  { to: "/dashboard", label: "Overview", icon: FiHome },
  { to: "/links", label: "Links", icon: FiLink2 },
  { to: "/analytics", label: "Analytics", icon: FiBarChart2 },
];

const ACCOUNT_LINKS = [
  { to: "/profile", label: "Profile", icon: FiUser },
  { to: "/settings", label: "Security", icon: FiSettings },
];

const Brand = () => (
  <Link to="/" className="brand" aria-label="Linkora-AI home">
    <span className="brand-mark" aria-hidden="true"><FiLink2 /></span>
    <span className="brand-wordmark">Linkora-AI</span>
  </Link>
);

const NavBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { token, setToken } = useStoreContext();
  const { theme, themePreference, setThemePreference } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const publicNavigationRef = useRef(null);
  const publicToggleRef = useRef(null);
  const isAppShell = ["/dashboard", "/links", "/analytics", "/profile", "/settings"]
    .some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const navigationLinks = publicNavigationRef.current?.querySelectorAll("a[href]");
    const closeOnEscapeAndTrapFocus = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        publicToggleRef.current?.focus();
      } else if (!isAppShell && event.key === "Tab" && navigationLinks?.length) {
        const firstLink = navigationLinks[0];
        const lastLink = navigationLinks[navigationLinks.length - 1];
        if (event.shiftKey && document.activeElement === firstLink) {
          event.preventDefault();
          lastLink.focus();
        } else if (!event.shiftKey && document.activeElement === lastLink) {
          event.preventDefault();
          firstLink.focus();
        }
      }
    };

    document.addEventListener("keydown", closeOnEscapeAndTrapFocus);
    if (!isAppShell) {
      document.body.style.overflow = "hidden";
      navigationLinks?.[0]?.focus();
    }

    return () => {
      document.removeEventListener("keydown", closeOnEscapeAndTrapFocus);
      if (!isAppShell) document.body.style.overflow = previousOverflow;
    };
  }, [isAppShell, menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const preference = themePreference === "system"
      ? theme
      : themePreference;
    setThemePreference(preference === "dark" ? "light" : "dark");
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("JWT_TOKEN");
    navigate("/login");
  };

  const renderLinks = (links) => links.map(({ to, label, icon: Icon }) => (
    <li key={to}>
      <Link
        className={`nav-link ${pathname === to ? "is-active" : ""}`}
        aria-current={pathname === to ? "page" : undefined}
        onClick={() => setMenuOpen(false)}
        to={to}
      >
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </Link>
    </li>
  ));

  if (isAppShell && token) {
    return (
      <aside className={`site-header app-sidebar ${menuOpen ? "menu-open" : ""}`}>
        <div className="sidebar-top">
          <Brand />
          <button
            className="nav-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="app-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>
        <nav className="app-navigation" id="app-navigation" aria-label="Workspace navigation">
          <span className="nav-section-label">Workspace</span>
          <ul className="nav-links">{renderLinks(APP_LINKS)}</ul>
          <span className="nav-section-label account-nav-label">Account</span>
          <ul className="nav-links">{renderLinks(ACCOUNT_LINKS)}</ul>
        </nav>
        <div className="sidebar-bottom">
          <button className="utility-button" type="button" onClick={toggleTheme}>
            {theme === "dark" ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
            <span>Use {theme === "dark" ? "light" : "dark"} theme</span>
          </button>
          <button className="utility-button logout-button" type="button" onClick={logout}>
            <FiLogOut aria-hidden="true" />
            <span>Sign out</span>
          </button>
          <div className="sidebar-product-note">
            <span className="sidebar-status-dot" aria-hidden="true" />
            <span>Linkora-AI workspace</span>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <header className="site-header public-header">
      <div className="public-nav-inner">
        <Brand />
        <nav
          aria-label="Primary navigation"
          className={`public-navigation ${menuOpen ? "is-open" : ""}`}
          id="public-navigation"
          ref={publicNavigationRef}
        >
          <ul className="public-nav-links">
            <li><a href="/#features" onClick={() => setMenuOpen(false)}>Features</a></li>
            <li><a href="/#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a></li>
            <li><a href="/#analytics" onClick={() => setMenuOpen(false)}>Analytics</a></li>
            {!token && (
              <li className="mobile-nav-only">
                <Link onClick={() => setMenuOpen(false)} to="/login">Sign in</Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="public-nav-actions">
          <button
            className="nav-toggle public-nav-toggle"
            type="button"
            ref={publicToggleRef}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="public-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
          <button
            className="icon-button theme-icon-button"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
          </button>
          {token ? (
            <Link to="/dashboard" className="button-primary nav-primary">Open workspace</Link>
          ) : (
            <>
              <Link to="/login" className="public-login-link">Sign in</Link>
              <Link to="/register" className="button-primary nav-primary">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
