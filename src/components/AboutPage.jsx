import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiLink2,
  FiSearch,
  FiUser,
} from "react-icons/fi";

const FEATURES = [
  {
    icon: FiLink2,
    title: "Shorten a destination",
    description: "Create a compact URL from a destination you already use.",
  },
  {
    icon: FiSearch,
    title: "Keep it findable",
    description: "Search the original destination or the short URL in one link library.",
  },
  {
    icon: FiBarChart2,
    title: "See daily activity",
    description: "Review aggregate click totals over the available date ranges.",
  },
  {
    icon: FiUser,
    title: "Manage your account",
    description: "Update your profile and verify changes to your account details.",
  },
];

const AboutPage = () => (
  <main className="page-shell about-page">
    <header className="about-intro">
      <span className="dashboard-eyebrow">ABOUT LINKORA-AI</span>
      <h1>Less friction between a link and the place it needs to go.</h1>
      <p>
        Linkora-AI is a focused workspace for creating short URLs, keeping track
        of their destinations, and reviewing the click activity the service
        makes available.
      </p>
    </header>
    <section className="about-capabilities" aria-labelledby="about-capabilities-title">
      <div className="about-section-heading">
        <div>
          <span className="dashboard-eyebrow">THE PRODUCT</span>
          <h2 id="about-capabilities-title">A few useful things, done clearly.</h2>
        </div>
        <p>No invented dashboards or hidden settings—just the tools that are available in your Linkora-AI account.</p>
      </div>
      <div className="about-feature-list">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <article className="about-feature" key={title}>
            <span className="about-feature-icon"><Icon aria-hidden="true" /></span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            <FiCheck className="about-feature-check" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
    <section className="about-cta">
      <div>
        <span className="dashboard-eyebrow">START WITH A DESTINATION</span>
        <h2>Make your next link easier to share.</h2>
      </div>
      <Link className="button-primary" to="/register">
        Create your account <FiArrowRight aria-hidden="true" />
      </Link>
    </section>
  </main>
);

export default AboutPage;
