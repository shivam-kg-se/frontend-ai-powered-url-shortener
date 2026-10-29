import { Link } from "react-router-dom";
import {
  FiArrowDown,
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiCopy,
  FiLink2,
  FiSearch,
} from "react-icons/fi";
import { useStoreContext } from "../contextApi/ContextValue";

const LandingPage = () => {
  const { token } = useStoreContext();
  const accountPath = token ? "/dashboard" : "/register";

  return (
    <main className="marketing-site">
      <section className="marketing-hero" aria-labelledby="marketing-title">
        <div className="marketing-hero-copy">
          <span className="marketing-kicker">
            <span className="marketing-kicker-dot" aria-hidden="true" />
            LINK MANAGEMENT, MADE CLEAR
          </span>
          <h1 id="marketing-title">
            A shorter link.
            <br />
            <span>A clearer picture.</span>
          </h1>
          <p className="marketing-hero-description">
            Turn long destinations into links you can share with confidence.
            Keep them organized and see the clicks they receive, all in one
            straightforward workspace.
          </p>
          <div className="marketing-hero-actions">
            <Link className="button-primary marketing-primary-cta" to={accountPath}>
              {token ? "Open your workspace" : "Create your account"}
              <FiArrowRight aria-hidden="true" />
            </Link>
            <a className="marketing-secondary-cta" href="#features">
              Explore Linkora-AI <FiArrowDown aria-hidden="true" />
            </a>
          </div>
          {!token && (
            <p className="marketing-signin-note">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          )}
        </div>

        <figure className="marketing-demo">
          <div className="demo-window">
            <div className="demo-window-bar">
              <div className="demo-window-controls" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span className="demo-window-title">Your links</span>
              <span className="demo-window-status">PRODUCT PREVIEW</span>
            </div>
            <div className="demo-workspace">
              <div className="demo-workspace-sidebar" aria-hidden="true">
                <span className="demo-mini-brand"><FiLink2 /></span>
                <span className="demo-sidebar-active"><FiLink2 /></span>
                <span><FiBarChart2 /></span>
              </div>
              <div className="demo-workspace-main">
                <div className="demo-toolbar">
                  <div>
                    <span className="demo-overline">LINK LIBRARY</span>
                    <h2>Links</h2>
                  </div>
                  <span className="demo-create-button"><span>+</span> New link</span>
                </div>
                <div className="demo-search"><FiSearch aria-hidden="true" /> Search your links</div>
                <div className="demo-table-heading">
                  <span>SHORT LINK</span><span>DESTINATION</span><span>CLICKS</span>
                </div>
                <div className="demo-link-row">
                  <span className="demo-short-link"><FiLink2 aria-hidden="true" /> linkora-ai.example/s/docs</span>
                  <span className="demo-destination">docs.example.com/guides/start</span>
                  <span className="demo-click-count">—</span>
                </div>
                <div className="demo-link-row">
                  <span className="demo-short-link"><FiLink2 aria-hidden="true" /> linkora-ai.example/s/notes</span>
                  <span className="demo-destination">example.com/product/notes</span>
                  <span className="demo-click-count">—</span>
                </div>
                <div className="demo-preview-note">
                  <FiCheck aria-hidden="true" />
                  <span>Illustrative interface · no account data</span>
                </div>
              </div>
            </div>
          </div>
          <figcaption className="marketing-demo-caption">
            A preview of the link library. Example links are not live.
          </figcaption>
        </figure>

        <a className="marketing-scroll-cue" href="#features" aria-label="Scroll to product features">
          <span />
        </a>
      </section>

      <section className="marketing-section marketing-features" id="features" aria-labelledby="features-title">
        <header className="marketing-section-heading">
          <span className="marketing-section-label">THE USEFUL PARTS</span>
          <h2 id="features-title">Everything you need to share a link. Nothing to decipher.</h2>
          <p>Linkora-AI brings the everyday link workflow into one focused place.</p>
        </header>
        <div className="marketing-feature-list">
          <article className="marketing-feature">
            <span className="marketing-feature-icon"><FiLink2 aria-hidden="true" /></span>
            <div>
              <h3>Make long URLs shareable</h3>
              <p>Create a compact short URL from a destination in your workspace, then copy it when it’s ready to share.</p>
            </div>
            <span className="marketing-feature-index">01</span>
          </article>
          <article className="marketing-feature">
            <span className="marketing-feature-icon"><FiSearch aria-hidden="true" /></span>
            <div>
              <h3>Find the right destination</h3>
              <p>Keep each short URL beside its original destination and search either one in your link library.</p>
            </div>
            <span className="marketing-feature-index">02</span>
          </article>
          <article className="marketing-feature" id="analytics">
            <span className="marketing-feature-icon"><FiBarChart2 aria-hidden="true" /></span>
            <div>
              <h3>Understand click activity</h3>
              <p>Review daily aggregate clicks over 7, 30, or 90 days, with per-link activity where available.</p>
            </div>
            <span className="marketing-feature-index">03</span>
          </article>
        </div>
        <p className="marketing-data-note">
          Analytics reflect the data returned by Linkora-AI’s current service. They do not represent unique visitors or device and location insights.
        </p>
      </section>

      <section className="marketing-workflow" id="how-it-works" aria-labelledby="workflow-title">
        <div className="marketing-workflow-intro">
          <span className="marketing-section-label">A SIMPLE WORKFLOW</span>
          <h2 id="workflow-title">From a long URL to ready to share.</h2>
          <p>No setup to decipher. Create an account, add a destination, and use your new short link wherever you need it.</p>
          <Link className="marketing-inline-link" to={accountPath}>
            {token ? "Go to your workspace" : "Get started"}
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
        <ol className="marketing-steps">
          <li>
            <span className="marketing-step-number">01</span>
            <div><h3>Set up your account</h3><p>Verify your email and create your sign-in details.</p></div>
          </li>
          <li>
            <span className="marketing-step-number">02</span>
            <div><h3>Add a destination</h3><p>Paste a URL into your workspace to create a short link.</p></div>
          </li>
          <li>
            <span className="marketing-step-number">03</span>
            <div><h3>Copy and review</h3><p>Share the short link and check its available click activity.</p></div>
          </li>
        </ol>
      </section>

      <section className="marketing-privacy" aria-labelledby="privacy-title">
        <div className="marketing-privacy-mark" aria-hidden="true"><FiCopy /></div>
        <div>
          <span className="marketing-section-label">HONEST BY DESIGN</span>
          <h2 id="privacy-title">The numbers mean what they say.</h2>
          <p>Linkora-AI shows the aggregate click counts available to it. We keep the experience focused on that data instead of implying visitor details the product does not provide.</p>
        </div>
        <a className="marketing-inline-link" href="#analytics">Explore analytics <FiArrowRight aria-hidden="true" /></a>
      </section>

      <section className="marketing-faq" aria-labelledby="faq-title">
        <header>
          <span className="marketing-section-label">GOOD TO KNOW</span>
          <h2 id="faq-title">A few quick answers.</h2>
        </header>
        <div className="marketing-faq-list">
          <details>
            <summary>Does the preview create a real short link?</summary>
            <p>No. The example interface is illustrative only. Create a link from your signed-in workspace to get a real short URL.</p>
          </details>
          <details>
            <summary>What does Linkora-AI show in analytics?</summary>
            <p>The current workspace shows daily aggregate clicks, with 7, 30, and 90 day ranges and per-link activity where available.</p>
          </details>
          <details>
            <summary>Can I manage my account details?</summary>
            <p>Profile, password, and verified email management are available in account settings.</p>
          </details>
        </div>
      </section>

      <section className="marketing-final-cta" aria-labelledby="final-cta-title">
        <div>
          <span className="marketing-section-label">YOUR LINKS, IN ONE PLACE</span>
          <h2 id="final-cta-title">Ready for a clearer link workflow?</h2>
          <p>Create your Linkora-AI account and start organizing the links you share.</p>
        </div>
        <Link className="button-primary marketing-primary-cta" to={accountPath}>
          {token ? "Open your workspace" : "Create your account"}
          <FiArrowRight aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
};

export default LandingPage;
