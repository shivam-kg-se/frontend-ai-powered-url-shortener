import { useMemo, useState } from "react";
import { FiLink2, FiPlus, FiSearch, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useStoreContext } from "../../contextApi/ContextValue";
import { useFetchMyShortUrls } from "../../hooks/useQuery";
import ShortenPopUp from "./ShortenPopUp";
import ShortenUrlList from "./ShortenUrlList";

const LinksPage = () => {
  const { token } = useStoreContext();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const { data: links = [], isLoading, refetch } = useFetchMyShortUrls(
    token,
    () => navigate("/error")
  );

  const visibleLinks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return links;
    return links.filter((link) =>
      [link.originalUrl, link.shortUrl].some((value) =>
        String(value || "").toLowerCase().includes(normalizedQuery)
      )
    );
  }, [links, query]);

  return (
    <main className="dashboard-shell">
      <div className="dashboard-content">
        <header className="dashboard-heading dashboard-page-heading">
          <div>
            <span className="dashboard-eyebrow">LINK LIBRARY</span>
            <h1>Every destination, in one place.</h1>
            <p>Search your short URLs or their original destinations.</p>
          </div>
          <button className="button-primary dashboard-create" onClick={() => setPopupOpen(true)} type="button">
            <FiPlus aria-hidden="true" /> Create a link
          </button>
        </header>

        <label className="link-search">
          <FiSearch aria-hidden="true" />
          <span className="visually-hidden">Search your links</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by short URL or destination"
            type="search"
            value={query}
          />
          {query && (
            <button
              className="icon-button"
              onClick={() => setQuery("")}
              type="button"
              aria-label="Clear search"
            >
              <FiX aria-hidden="true" />
            </button>
          )}
        </label>

        {!isLoading && links.length > 0 && (
          <p className="links-result-count" aria-live="polite">
            {query
              ? `${visibleLinks.length} of ${links.length} links`
              : `${links.length} ${links.length === 1 ? "link" : "links"}`}
          </p>
        )}

        {isLoading ? (
          <div className="link-skeleton-list" aria-label="Loading links" role="status">
            <div className="link-skeleton" />
            <div className="link-skeleton" />
            <div className="link-skeleton" />
          </div>
        ) : visibleLinks.length ? (
          <ShortenUrlList data={visibleLinks} />
        ) : (
          <div className="dashboard-empty">
            <span className="empty-state-icon"><FiLink2 aria-hidden="true" /></span>
            <h2>{query ? "No links found" : "Your link library is empty"}</h2>
            <p>{query ? "Try a different search or clear the current query." : "Create your first short URL to keep a destination close at hand."}</p>
            {query ? (
              <button className="button-secondary" onClick={() => setQuery("")} type="button">Clear search</button>
            ) : (
              <button className="button-secondary" onClick={() => setPopupOpen(true)} type="button">
                <FiPlus aria-hidden="true" /> Create your first link
              </button>
            )}
          </div>
        )}
      </div>
      <ShortenPopUp refetch={refetch} open={popupOpen} setOpen={setPopupOpen} />
    </main>
  );
};

export default LinksPage;
