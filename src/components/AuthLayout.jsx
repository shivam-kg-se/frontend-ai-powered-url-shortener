import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FiArrowRight, FiLink2 } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

const AuthLayout = ({ children, eyebrow, headline, description }) => (
  <main className="auth-page">
    <aside className="auth-story">
      <Link to="/" className="auth-brand" aria-label="Linkora-AI home">
        <span className="brand-mark"><FiLink2 aria-hidden="true" /></span>
        <span>Linkora-AI</span>
      </Link>
      <div className="auth-story-content">
        <span className="auth-story-eyebrow">{eyebrow}</span>
        <h1>{headline}</h1>
        <p>{description}</p>
        <div className="auth-flow-preview" aria-label="Illustration of a URL shortening flow">
          <div className="auth-flow-node">
            <span className="auth-flow-dot" />
            <span>Long destination</span>
            <code>/docs/guides/launch</code>
          </div>
          <div className="auth-flow-connector"><span /><FiArrowRight aria-hidden="true" /><span /></div>
          <div className="auth-flow-node auth-flow-node-active">
            <span className="auth-flow-dot" />
            <span>Ready to share</span>
            <code>linkora-ai.example/s/launch</code>
          </div>
        </div>
      </div>
      <p className="auth-story-caption">Illustrative product flow. Create and manage your links in your workspace.</p>
    </aside>
    <section className="auth-panel">
      <div className="auth-panel-top">
        <Link to="/" className="auth-panel-brand"><FiLink2 aria-hidden="true" /> Linkora-AI</Link>
        <ThemeToggle />
      </div>
      <div className="auth-panel-content">{children}</div>
      <p className="auth-panel-footnote">Linkora-AI · Short links, thoughtfully managed.</p>
    </section>
  </main>
);

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  eyebrow: PropTypes.string.isRequired,
  headline: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default AuthLayout;
