import dayjs from "dayjs";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiBarChart2, FiPlus, FiZap } from "react-icons/fi";
import Graph from "./LazyGraph";
import { useStoreContext } from "../../contextApi/ContextValue";
import { useFetchMyShortUrls, useFetchTotalClicks } from "../../hooks/useQuery";
import ShortenPopUp from "./ShortenPopUp";
import ShortenUrlList from "./ShortenUrlList";

const DashboardLayout = () => {
  const { token } = useStoreContext();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  const handleError = () => navigate("/error");
  const { isLoading: linksLoading, data: links = [], refetch } =
    useFetchMyShortUrls(token, handleError);
  const { isLoading: clicksLoading, data: clicks = [] } =
    useFetchTotalClicks(token, handleError, 30);

  const clickTotal = clicks.reduce((sum, item) => sum + item.count, 0);
  const rangeLabel = `${dayjs().subtract(29, "day").format("MMM D")} – ${dayjs().format("MMM D, YYYY")}`;
  const recentLinks = links.slice(0, 5);

  return (
    <main className="dashboard-shell">
      <div className="dashboard-content">
        <header className="dashboard-heading dashboard-page-heading">
          <div>
            <span className="dashboard-eyebrow">OVERVIEW</span>
            <h1>Your links, at a glance.</h1>
            <p>A clear view of your short links and recent click activity.</p>
          </div>
          <button className="button-primary dashboard-create" onClick={() => setCreateOpen(true)} type="button">
            <FiPlus aria-hidden="true" /> Create a link
          </button>
        </header>

        <section className="dashboard-metrics" aria-label="Workspace summary">
          <article className="metric-card">
            <span className="metric-label">Links created</span>
            <strong className="metric-value">{linksLoading ? "—" : links.length.toLocaleString()}</strong>
            <span className="metric-context">In your workspace</span>
          </article>
          <article className="metric-card">
            <span className="metric-label">Clicks · last 30 days</span>
            <strong className="metric-value">{clicksLoading ? "—" : clickTotal.toLocaleString()}</strong>
            <span className="metric-context">{rangeLabel}</span>
          </article>
          <Link className="overview-analytics-link" to="/analytics">
            <span className="overview-analytics-icon"><FiBarChart2 aria-hidden="true" /></span>
            <span>
              <strong>Explore analytics</strong>
              <small>See click activity over time</small>
            </span>
            <FiArrowRight className="overview-analytics-arrow" aria-hidden="true" />
          </Link>
        </section>

        <section className="dashboard-chart" aria-labelledby="overview-chart-title">
          <div className="dashboard-panel-heading">
            <div>
              <h2 id="overview-chart-title">Click activity</h2>
              <p>Daily clicks · {rangeLabel}</p>
            </div>
            <Link to="/analytics" className="text-link">View analytics <FiArrowRight aria-hidden="true" /></Link>
          </div>
          {clicksLoading ? (
            <div className="chart-loading" role="status">Loading click activity…</div>
          ) : clicks.length ? (
            <Graph graphData={clicks} />
          ) : (
            <div className="chart-empty">
              <span className="empty-state-icon"><FiZap aria-hidden="true" /></span>
              <h3>No activity in this period</h3>
              <p>Daily click totals will show here when your short links receive visits.</p>
            </div>
          )}
        </section>

        <section className="dashboard-recent" aria-labelledby="recent-links-title">
          <div className="dashboard-actions">
            <div className="dashboard-list-heading">
              <h2 id="recent-links-title">Recent links</h2>
              <p>Your latest short URLs, ready to share.</p>
            </div>
            <Link className="text-link" to="/links">All links <FiArrowRight aria-hidden="true" /></Link>
          </div>
          {linksLoading ? (
            <div className="link-skeleton-list" aria-label="Loading links" role="status">
              <div className="link-skeleton" />
              <div className="link-skeleton" />
            </div>
          ) : recentLinks.length ? (
            <ShortenUrlList data={recentLinks} />
          ) : (
            <div className="dashboard-empty">
              <span className="empty-state-icon"><FiZap aria-hidden="true" /></span>
              <h2>Your first short link starts here</h2>
              <p>Create a shareable URL and keep its destination easy to find.</p>
              <button className="button-secondary" onClick={() => setCreateOpen(true)} type="button">
                <FiPlus aria-hidden="true" /> Create your first link
              </button>
            </div>
          )}
        </section>
      </div>

      <ShortenPopUp refetch={refetch} open={createOpen} setOpen={setCreateOpen} />
    </main>
  );
};

export default DashboardLayout;
