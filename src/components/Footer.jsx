
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiLink2,
  FiMail,
} from "react-icons/fi";
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";
import { useStoreContext } from "../contextApi/ContextValue";

const Footer = () => {
  const { token } = useStoreContext();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand-block">
          <Link to="/" className="footer-brand" aria-label="Linkora-AI home">
          <span className="brand-mark" aria-hidden="true">
            <FiLink2 />
          </span>
            <span>Linkora-AI</span>
          </Link>

          <p className="footer-description">
            Short links, thoughtfully managed.
          </p>
        </div>

        {/* Contact and social links */}
        <div className="footer-contact">
          <h2 className="footer-nav-label">GET IN TOUCH</h2>

          <a
              className="footer-contact-link"
              href="mailto:shivam.kg.se@gmail.com"
          >
            <FiMail aria-hidden="true" />
            <span>shivam.kg.se@gmail.com</span>
          </a>

          <div
              className="footer-social-links"
              aria-label="Social and messaging links"
          >
            <a
                aria-label="LinkedIn"
                className="footer-social-link"
                href="https://www.linkedin.com/in/shivamkgse/"
                rel="noopener noreferrer"
                target="_blank"
            >
              <FaLinkedinIn aria-hidden="true" />
              <span>LinkedIn</span>
              <FiArrowUpRight aria-hidden="true" />
            </a>

            <a
                aria-label="GitHub"
                className="footer-social-link"
                href="https://github.com/shivam-kg-se"
                rel="noopener noreferrer"
                target="_blank"
            >
              <FaGithub aria-hidden="true" />
              <span>GitHub</span>
              <FiArrowUpRight aria-hidden="true" />
            </a>

            <a
                aria-label="Instagram"
                className="footer-social-link"
                href="https://www.instagram.com/er.r.404/"
                rel="noopener noreferrer"
                target="_blank"
            >
              <FaInstagram aria-hidden="true" />
              <span>Instagram</span>
              <FiArrowUpRight aria-hidden="true" />
            </a>

            <a
                aria-label="WhatsApp 8922015449"
                className="footer-social-link"
                href="https://wa.me/918922015449"
                rel="noopener noreferrer"
                target="_blank"
            >
              <FaWhatsapp aria-hidden="true" />
              <span>8922015449</span>
              <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Footer navigation */}
        <nav
            className="footer-navigation"
            aria-label="Footer navigation"
        >
          <div>
            <h2 className="footer-nav-label">EXPLORE</h2>
            <a href="/#features">Features</a>
            <a href="/#how-it-works">How it works</a>
            <a href="/#analytics">Analytics</a>
            <Link to="/about">About Linkora-AI</Link>
          </div>

          {!token && (
            <div>
              <h2 className="footer-nav-label">ACCOUNT</h2>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create account</Link>
            </div>
          )}
        </nav>

        {/* Footer bottom */}
        <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Linkora-AI
        </span>

          <button
              type="button"
              onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches
                        ? "auto"
                        : "smooth",
                  })
              }
          >
            Back to top <FiArrowUpRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
