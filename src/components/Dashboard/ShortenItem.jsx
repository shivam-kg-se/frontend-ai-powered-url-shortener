import dayjs from "dayjs";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBarChart2,
  FiCalendar,
  FiCheck,
  FiCopy,
  FiExternalLink,
  FiLink2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../api/api";
import { useStoreContext } from "../../contextApi/ContextValue";
import Graph from "./LazyGraph";

const RANGE_OPTIONS = [7, 30, 90];

const getSafeDestination = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

const getShortUrl = (shortUrl) => {
  const baseUrl = (
    import.meta.env.VITE_REACT_FRONT_END_URL || window.location.origin
  ).replace(/\/+$/, "");
  return `${baseUrl}/s/${encodeURIComponent(shortUrl)}`;
};

const ShortenItem = ({ originalUrl, shortUrl, clickCount, createdDate }) => {
  const { token } = useStoreContext();
  const [copied, setCopied] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsRange, setAnalyticsRange] = useState(30);
  const [retry, setRetry] = useState(0);
  const destination = getSafeDestination(originalUrl);
  const shortUrlValue = getShortUrl(shortUrl);
  const parsedClickCount = Number(clickCount);
  const hasClickCount = clickCount != null
    && clickCount !== ""
    && Number.isFinite(parsedClickCount);

  useEffect(() => {
    if (!analyticsOpen || !shortUrl || !token) return undefined;
    let cancelled = false;

    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError("");
      try {
        const response = await api.get(
          `/api/urls/analytics/${encodeURIComponent(shortUrl)}`,
          {
            params: {
              startDate: dayjs()
                .subtract(analyticsRange - 1, "day")
                .startOf("day")
                .format("YYYY-MM-DDTHH:mm:ss"),
              endDate: dayjs().endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
            },
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let result = response.data;
        if (typeof result === "string") {
          result = result.trim() ? JSON.parse(result) : [];
        }
        if (!Array.isArray(result)) {
          if (Array.isArray(result?.data)) result = result.data;
          else if (Array.isArray(result?.analytics)) result = result.analytics;
          else throw new Error("Unexpected analytics response.");
        }

        const normalized = result
          .filter((item) =>
            item
            && item.clickDate != null
            && item.count != null
            && item.count !== ""
            && Number.isFinite(Number(item.count))
          )
          .map((item) => ({
            clickDate: String(item.clickDate),
            count: Number(item.count),
          }))
          .sort((a, b) => a.clickDate.localeCompare(b.clickDate));

        if (!cancelled) setAnalyticsData(normalized);
      } catch {
        if (!cancelled) {
          setAnalyticsError("We couldn’t load analytics for this link. Try again.");
        }
      } finally {
        if (!cancelled) setAnalyticsLoading(false);
      }
    };

    void fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, [analyticsOpen, analyticsRange, retry, shortUrl, token]);

  const copyShortUrl = async () => {
    try {
      await navigator.clipboard.writeText(shortUrlValue);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Clipboard access is unavailable. Select the short URL text to copy it.");
    }
  };

  return (
    <>
      <tr className="link-table-row">
        <td data-label="Short URL">
          <div className="table-short-url">
            <span className="table-link-icon"><FiLink2 aria-hidden="true" /></span>
            <div className="table-link-copy">
              <Link
                className="short-url-link"
                rel="noopener noreferrer"
                target="_blank"
                to={`/s/${encodeURIComponent(shortUrl)}`}
              >
                {shortUrlValue.replace(/^https?:\/\//, "")}
              </Link>
              <span className="table-link-hint">Short link</span>
            </div>
          </div>
        </td>
        <td data-label="Destination">
          {destination ? (
            <a className="destination-link" href={destination} rel="noopener noreferrer" target="_blank">
              <span>{originalUrl}</span><FiExternalLink aria-hidden="true" />
            </a>
          ) : (
            <span className="destination-link">{originalUrl || "Destination unavailable"}</span>
          )}
        </td>
        <td data-label="Clicks">
          <span className="table-click-count">
            {hasClickCount ? parsedClickCount.toLocaleString() : "—"}
          </span>
        </td>
        <td data-label="Created">
          <span className="table-date">
            <FiCalendar aria-hidden="true" />
            {createdDate && dayjs(createdDate).isValid()
              ? dayjs(createdDate).format("MMM D, YYYY")
              : "Date unavailable"}
          </span>
        </td>
        <td data-label="Actions">
          <div className="table-actions">
            <button type="button" className="icon-button row-action" onClick={() => void copyShortUrl()} aria-label={copied ? "Short URL copied" : "Copy short URL"} title="Copy short URL">
              {copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
            </button>
            <button
              type="button"
              className={`icon-button row-action ${analyticsOpen ? "is-selected" : ""}`}
              onClick={() => setAnalyticsOpen((open) => !open)}
              aria-expanded={analyticsOpen}
              aria-label={`${analyticsOpen ? "Hide" : "View"} analytics for ${shortUrl}`}
              title="Link analytics"
            >
              <FiBarChart2 aria-hidden="true" />
            </button>
          </div>
        </td>
      </tr>
      {analyticsOpen && (
        <tr className="link-analytics-row">
          <td colSpan="5">
            <section className="link-analytics-detail" aria-label={`Analytics for ${shortUrl}`}>
              <div className="analytics-controls">
                <div>
                  <h3>Link activity</h3>
                  <p>Daily click totals for this short URL.</p>
                </div>
                <div className="range-selector" aria-label="Link analytics date range">
                  {RANGE_OPTIONS.map((days) => (
                    <button
                      type="button"
                      key={days}
                      aria-pressed={analyticsRange === days}
                      className={`range-option ${analyticsRange === days ? "is-selected" : ""}`}
                      onClick={() => setAnalyticsRange(days)}
                    >
                      {days} days
                    </button>
                  ))}
                </div>
              </div>
              {analyticsLoading ? (
                <div className="chart-loading" role="status">Loading link analytics…</div>
              ) : analyticsError ? (
                <div className="analytics-inline-error" role="alert">
                  <p>{analyticsError}</p>
                  <button type="button" className="button-secondary" onClick={() => setRetry((count) => count + 1)}>Try again</button>
                </div>
              ) : analyticsData.length ? (
                <Graph graphData={analyticsData} />
              ) : (
                <div className="chart-empty">
                  <h3>No activity in this period</h3>
                  <p>Daily clicks for this link will appear here when available.</p>
                </div>
              )}
            </section>
          </td>
        </tr>
      )}
    </>
  );
};

ShortenItem.propTypes = {
  originalUrl: PropTypes.string.isRequired,
  shortUrl: PropTypes.string.isRequired,
  clickCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  createdDate: PropTypes.string,
};

export default ShortenItem;
