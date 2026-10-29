import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";
import Graph from "./LazyGraph";
import Loader from "../Loader";
import { useStoreContext } from "../../contextApi/ContextValue";
import { useFetchMyShortUrls, useFetchTotalClicks } from "../../hooks/useQuery";
import ShortenUrlList from "./ShortenUrlList";

const RANGE_OPTIONS = [
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
  { id: "this-month", label: "This month" },
  { id: "previous-month", label: "Previous month" },
  { id: "custom", label: "Custom" },
];
const PAGE_SIZE = 10;

const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");

const getRange = (preset, customStart, customEnd) => {
  const today = dayjs();
  if (preset === "custom") {
    const validStart = dayjs(customStart).isValid()
      && formatDate(customStart) === customStart;
    const validEnd = dayjs(customEnd).isValid()
      && formatDate(customEnd) === customEnd;

    return validStart && validEnd && customStart <= customEnd
      ? { startDate: customStart, endDate: customEnd }
      : null;
  }

  if (preset === "this-month") {
    return {
      startDate: today.startOf("month").format("YYYY-MM-DD"),
      endDate: today.format("YYYY-MM-DD"),
    };
  }

  if (preset === "previous-month") {
    const previousMonth = today.startOf("month").subtract(1, "month");
    return {
      startDate: previousMonth.startOf("month").format("YYYY-MM-DD"),
      endDate: previousMonth.endOf("month").format("YYYY-MM-DD"),
    };
  }

  const days = Number(preset);
  return {
    startDate: today.subtract(days - 1, "day").format("YYYY-MM-DD"),
    endDate: today.format("YYYY-MM-DD"),
  };
};

const getPreviousRange = (range, preset) => {
  if (preset === "this-month" || preset === "previous-month") {
    const previousStart = dayjs(range.startDate).subtract(1, "month");
    return {
      startDate: previousStart.startOf("month").format("YYYY-MM-DD"),
      endDate: previousStart.endOf("month").format("YYYY-MM-DD"),
    };
  }

  const numberOfDays = dayjs(range.endDate).diff(range.startDate, "day") + 1;
  const endDate = dayjs(range.startDate).subtract(1, "day");
  return {
    startDate: endDate.subtract(numberOfDays - 1, "day").format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
  };
};

const hasClickCount = (link) =>
  link.clickCount != null
  && link.clickCount !== ""
  && Number.isFinite(Number(link.clickCount));

const AnalyticsPage = () => {
  const { token } = useStoreContext();
  const [rangePreset, setRangePreset] = useState("30");
  const [customStart, setCustomStart] = useState(
    dayjs().subtract(29, "day").format("YYYY-MM-DD")
  );
  const [customEnd, setCustomEnd] = useState(dayjs().format("YYYY-MM-DD"));
  const [linkSearch, setLinkSearch] = useState("");
  const [linkSort, setLinkSort] = useState("clicks");
  const [page, setPage] = useState(1);
  const range = useMemo(
    () => getRange(rangePreset, customStart, customEnd),
    [rangePreset, customStart, customEnd]
  );
  const previousRange = useMemo(
    () => range && getPreviousRange(range, rangePreset),
    [range, rangePreset]
  );
  const {
    data: clicks = [],
    isLoading: clicksLoading,
    isFetching: clicksFetching,
    isError: clicksError,
    refetch: refreshClicks,
  } = useFetchTotalClicks(range ? token : null, undefined, range || {});
  const {
    data: previousClicks = [],
    isLoading: previousClicksLoading,
    isFetching: previousClicksFetching,
    isError: previousClicksError,
    refetch: refreshPreviousClicks,
  } = useFetchTotalClicks(
    range ? token : null,
    undefined,
    previousRange || {}
  );
  const {
    data: links = [],
    isLoading: linksLoading,
    isFetching: linksFetching,
    isError: linksError,
    refetch: refreshLinks,
  } = useFetchMyShortUrls(token);

  const total = clicks.reduce((sum, item) => sum + item.count, 0);
  const previousTotal = previousClicks.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const activeLinks = links.filter(
    (link) => hasClickCount(link) && Number(link.clickCount) > 0
  );
  const allTimeClicks = links.reduce(
    (sum, link) => sum + (hasClickCount(link) ? Number(link.clickCount) : 0),
    0
  );
  const allLinkCountsAvailable = links.every(hasClickCount);
  const periodChange = previousTotal > 0
    ? ((total - previousTotal) / previousTotal) * 100
    : null;
  const startDate = range
    ? dayjs(range.startDate).format("MMM D, YYYY")
    : "Select valid dates";
  const endDate = range
    ? dayjs(range.endDate).format("MMM D, YYYY")
    : "";
  const filteredLinks = useMemo(() => {
    const query = linkSearch.trim().toLowerCase();
    return links
      .filter((link) =>
        !query
        || String(link.shortUrl || "").toLowerCase().includes(query)
        || String(link.originalUrl || "").toLowerCase().includes(query)
      )
      .sort((a, b) => {
        if (linkSort === "newest") {
          return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
        }
        const aCount = hasClickCount(a) ? Number(a.clickCount) : -1;
        const bCount = hasClickCount(b) ? Number(b.clickCount) : -1;
        return bCount - aCount;
      });
  }, [links, linkSearch, linkSort]);
  const pageCount = Math.ceil(filteredLinks.length / PAGE_SIZE);
  const pageLinks = filteredLinks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isDefaultView = rangePreset === "30" && !linkSearch && linkSort === "clicks";

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(pageCount, 1)));
  }, [pageCount]);

  const refresh = () => {
    void refreshClicks();
    void refreshPreviousClicks();
    void refreshLinks();
  };

  return (
    <main className="dashboard-shell">
      <div className="dashboard-content">
        <header className="dashboard-heading dashboard-page-heading">
          <div>
            <span className="dashboard-eyebrow">INSIGHTS</span>
            <h1>Know what’s getting clicked.</h1>
            <p>Explore click activity and link performance across a date range.</p>
          </div>
          <button
            className="button-secondary refresh-button"
            disabled={clicksFetching || previousClicksFetching || linksFetching}
            onClick={refresh}
            type="button"
            aria-label={clicksFetching || previousClicksFetching || linksFetching ? "Refreshing analytics" : "Refresh analytics"}
          >
            <FiRefreshCw aria-hidden="true" className={clicksFetching || previousClicksFetching || linksFetching ? "is-spinning" : ""} />
            Refresh
          </button>
        </header>

        <section className="analytics-filters" aria-label="Analytics filters">
          <div className="analytics-filter-group">
            <span className="analytics-range-label">Date range</span>
            <div className="range-selector analytics-date-presets" role="group" aria-label="Analytics date range">
              {RANGE_OPTIONS.map((option) => (
                <button
                  aria-pressed={rangePreset === option.id}
                  className={`range-option ${rangePreset === option.id ? "is-selected" : ""}`}
                  key={option.id}
                  onClick={() => setRangePreset(option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {rangePreset === "custom" && (
            <div className="custom-date-range">
              <label>
                <span>From</span>
                <input
                  type="date"
                  value={customStart}
                  max={customEnd || undefined}
                  onChange={(event) => setCustomStart(event.target.value)}
                />
              </label>
              <label>
                <span>To</span>
                <input
                  type="date"
                  value={customEnd}
                  min={customStart || undefined}
                  max={dayjs().format("YYYY-MM-DD")}
                  onChange={(event) => setCustomEnd(event.target.value)}
                />
              </label>
            </div>
          )}
          <div className="analytics-filter-status" aria-live="polite">
            <span>
              {range ? `${startDate} – ${endDate}` : "Choose a valid start and end date"}
            </span>
            {!isDefaultView && (
              <button
                className="analytics-clear-button"
                type="button"
                onClick={() => {
                  setRangePreset("30");
                  setLinkSearch("");
                  setLinkSort("clicks");
                  setPage(1);
                }}
              >
                <FiX aria-hidden="true" /> Clear filters
              </button>
            )}
          </div>
        </section>

        <section className="analytics-metrics" aria-label="Click activity summary">
          <article className="metric-card analytics-metric-card">
            <span className="metric-label">Clicks in period</span>
            <strong className="metric-value">{clicksLoading ? "—" : total.toLocaleString()}</strong>
            <span className="metric-context">{startDate}{endDate ? ` – ${endDate}` : ""}</span>
          </article>
          <article className="metric-card analytics-metric-card">
            <span className="metric-label">Previous period</span>
            <strong className="metric-value">
              {previousClicksLoading || clicksLoading || previousClicksError || clicksError
                ? "—"
                : periodChange == null
                  ? total > 0 ? "New activity" : "No clicks"
                  : `${periodChange > 0 ? "+" : ""}${periodChange.toFixed(1)}%`}
            </strong>
            <span className="metric-context">
              {previousClicksError || clicksError
                ? "Comparison unavailable"
                : previousTotal.toLocaleString() + " clicks in the preceding period"}
            </span>
          </article>
          <article className="metric-card analytics-metric-card">
            <span className="metric-label">Links with clicks</span>
            <strong className="metric-value">{linksLoading ? "—" : activeLinks.length.toLocaleString()}</strong>
            <span className="metric-context">Based on reported link totals</span>
          </article>
          <article className="metric-card analytics-metric-card">
            <span className="metric-label">All-time clicks</span>
            <strong className="metric-value">
              {linksLoading || !allLinkCountsAvailable ? "—" : allTimeClicks.toLocaleString()}
            </strong>
            <span className="metric-context">Sum of reported link totals</span>
          </article>
        </section>

        <section className="dashboard-chart analytics-chart" aria-labelledby="analytics-chart-title">
          <div className="dashboard-panel-heading">
            <div>
              <h2 id="analytics-chart-title">Daily click activity</h2>
              <p>{startDate}{endDate ? ` – ${endDate}` : ""}</p>
            </div>
          </div>
          {!range ? (
            <div className="analytics-inline-error" role="alert">
              <p>Choose a valid start and end date to load analytics.</p>
            </div>
          ) : clicksError ? (
            <div className="analytics-inline-error" role="alert">
              <p>We couldn’t load click activity. Check your connection and try again.</p>
              <button className="button-secondary" type="button" onClick={() => void refreshClicks()}>
                Try again
              </button>
            </div>
          ) : clicksLoading ? (
            <Loader />
          ) : clicks.length ? (
            <Graph graphData={clicks} />
          ) : (
            <div className="chart-empty analytics-empty">
              <h3>No activity in this period</h3>
              <p>Daily click totals will appear here when the analytics service returns data.</p>
            </div>
          )}
        </section>

        <section className="analytics-links-section" aria-labelledby="top-links-title">
          <div className="dashboard-actions">
            <div className="dashboard-list-heading">
              <h2 id="top-links-title">Link performance</h2>
              <p>Click totals shown here are all-time counts returned with each link.</p>
            </div>
            <Link to="/links" className="text-link">All links <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="analytics-link-controls">
            <label className="analytics-search">
              <FiSearch aria-hidden="true" />
              <span className="visually-hidden">Search links by short URL or destination</span>
              <input
                type="search"
                placeholder="Search short URL or destination"
                value={linkSearch}
                onChange={(event) => {
                  setLinkSearch(event.target.value);
                  setPage(1);
                }}
              />
              {linkSearch && (
                <button
                  type="button"
                  aria-label="Clear link search"
                  onClick={() => {
                    setLinkSearch("");
                    setPage(1);
                  }}
                >
                  <FiX aria-hidden="true" />
                </button>
              )}
            </label>
            <label className="analytics-sort">
              <span>Sort by</span>
              <select
                value={linkSort}
                onChange={(event) => {
                  setLinkSort(event.target.value);
                  setPage(1);
                }}
              >
                <option value="clicks">Most clicks</option>
                <option value="newest">Newest</option>
              </select>
            </label>
          </div>
          {linksLoading ? (
            <div className="link-skeleton-list" role="status" aria-label="Loading links">
              <div className="link-skeleton" />
              <div className="link-skeleton" />
            </div>
          ) : linksError ? (
            <div className="analytics-inline-error" role="alert">
              <p>We couldn’t load your links. Check your connection and try again.</p>
              <button className="button-secondary" type="button" onClick={() => void refreshLinks()}>
                Try again
              </button>
            </div>
          ) : filteredLinks.length ? (
            <>
              <p className="links-result-count">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredLinks.length)} of {filteredLinks.length} links
              </p>
              <ShortenUrlList data={pageLinks} />
              {pageCount > 1 && (
                <nav className="analytics-pagination" aria-label="Link performance pages">
                  <span>Page {page} of {pageCount}</span>
                  <div>
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={page === 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      <FiArrowLeft aria-hidden="true" /> Previous
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={page === pageCount}
                      onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                    >
                      Next <FiArrowRight aria-hidden="true" />
                    </button>
                  </div>
                </nav>
              )}
            </>
          ) : (
            <div className="dashboard-empty compact-empty">
              <h3>{linkSearch ? "No links match your search" : "No link performance to show yet"}</h3>
              <p>{linkSearch ? "Try a different short URL or destination." : "Create a link and share it to see its click data here."}</p>
              {linkSearch ? (
                <button className="button-secondary" type="button" onClick={() => setLinkSearch("")}>
                  Clear search
                </button>
              ) : (
                <Link to="/links" className="button-secondary">Open links</Link>
              )}
            </div>
          )}
        </section>
        <p className="analytics-footnote">
          Click trends and period comparisons use the existing daily aggregate endpoint. Link totals are displayed separately as all-time counts. Unique visitors, traffic dimensions, and server-side link filters are not available in the current analytics API.
        </p>
      </div>
    </main>
  );
};

export default AnalyticsPage;
