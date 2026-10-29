import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useTheme } from "./contextApi/ThemeContextValue";
import Navbar from "./components/NavBar";
import ShortenUrlPage from "./components/ShortenUrlPage";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import AboutPage from "./components/AboutPage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
import ErrorPage from "./components/ErrorPage";
import ProfilePage from "./components/ProfilePage";
import SecuritySettingsPage from "./components/SecuritySettingsPage";
import LinksPage from "./components/Dashboard/LinksPage";
import AnalyticsPage from "./components/Dashboard/AnalyticsPage";

const ROUTE_METADATA = {
  "/": {
    title: "Linkora-AI — A shorter link. A clearer picture.",
    description: "Create short links, keep destinations organized, and review the daily click activity available in your Linkora-AI workspace.",
  },
  "/about": {
    title: "About Linkora-AI",
    description: "Learn how Linkora-AI helps you create, organize, and review short links.",
  },
  "/login": {
    title: "Sign in — Linkora-AI",
    description: "Sign in to manage your Linkora-AI short links.",
  },
  "/register": {
    title: "Create an account — Linkora-AI",
    description: "Create a Linkora-AI account to manage your short links.",
  },
  "/dashboard": {
    title: "Overview — Linkora-AI",
    description: "Your Linkora-AI workspace overview.",
  },
  "/links": {
    title: "My links — Linkora-AI",
    description: "Search and manage your Linkora-AI short links.",
  },
  "/analytics": {
    title: "Analytics — Linkora-AI",
    description: "Review daily click activity for your Linkora-AI short links.",
  },
  "/profile": {
    title: "Profile — Linkora-AI",
    description: "Manage your Linkora-AI account profile.",
  },
  "/settings": {
    title: "Security — Linkora-AI",
    description: "Manage your Linkora-AI password and verified email.",
  },
};

// <PrivateRoute publicPage={true}>
//      <RegisterPage />
// </PrivateRoute>

const AppRouter = () => {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const hideHeaderFooter = pathname.startsWith("/s/") || isAuthPage;
  const isAppShell = ["/dashboard", "/links", "/analytics", "/profile", "/settings"]
    .some((route) => pathname.startsWith(route));
  const metadata = ROUTE_METADATA[pathname];
  const noIndex = isAppShell
    || pathname === "/login"
    || pathname === "/register"
    || pathname === "/error"
    || pathname.startsWith("/s/")
    || !metadata;

  useEffect(() => {
    document.title = metadata?.title || "Page not found — Linkora-AI";

    const description = document.querySelector('meta[name="description"]');
    if (description && metadata) {
      description.setAttribute("content", metadata.description);
    }

    const updateProperty = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    const updateName = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    updateName("theme-color", theme === "dark" ? "#09090b" : "#fbfbfc");

    let robots = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.setAttribute("name", "robots");
        document.head.appendChild(robots);
      }
      robots.setAttribute("content", "noindex, nofollow");
      document.querySelector('link[rel="canonical"]')?.remove();
    } else if (robots) {
      robots.remove();
    }

    if (metadata && !noIndex) {
      updateProperty("og:title", metadata.title);
      updateProperty("og:description", metadata.description);
      updateProperty("og:url", new URL(pathname, window.location.origin).href);
      updateName("twitter:title", metadata.title);
      updateName("twitter:description", metadata.description);
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", new URL(pathname, window.location.origin).href);
    }
  }, [metadata, noIndex, pathname, theme]);

    return (
        <>
        {!hideHeaderFooter && <Navbar /> }
        <Toaster
          position="bottom-center"
          toastOptions={{ className: "app-toast" }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/s/:url" element={<ShortenUrlPage />} />

          <Route path="/register" element={<PrivateRoute publicPage={true}><RegisterPage /></PrivateRoute>} />
          <Route path="/login" element={<PrivateRoute publicPage={true}><LoginPage /></PrivateRoute>} />
          
          <Route path="/dashboard" element={ <PrivateRoute publicPage={false}><DashboardLayout /></PrivateRoute>} />
          <Route path="/links" element={ <PrivateRoute publicPage={false}><LinksPage /></PrivateRoute>} />
          <Route path="/analytics" element={ <PrivateRoute publicPage={false}><AnalyticsPage /></PrivateRoute>} />
          <Route path="/profile" element={ <PrivateRoute publicPage={false}><ProfilePage /></PrivateRoute>} />
          <Route path="/settings" element={ <PrivateRoute publicPage={false}><SecuritySettingsPage /></PrivateRoute>} />
          <Route path="/error" element={ <ErrorPage />} />
          <Route path="*" element={ <ErrorPage message="We can't seem to find the page you're looking for"/>} />
        </Routes>
        {!hideHeaderFooter && !isAppShell && <Footer />}
      </>
    );
}


export default AppRouter;

export const SubDomainRouter = () => {
    return (
        <Routes>
          <Route path="/:url" element={<ShortenUrlPage />} />
        </Routes>
    )
}