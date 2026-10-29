import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContextValue";

const getInitialTheme = () => {
  const savedTheme = window.localStorage.getItem("linklytics-theme");

  if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
    return savedTheme;
  }

  return "system";
};

const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreference] = useState(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
  const theme = themePreference === "system" ? systemTheme : themePreference;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = (event) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", updateSystemTheme);

    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("linklytics-theme", themePreference);
  }, [themePreference]);

  return (
    <ThemeContext.Provider value={{ theme, themePreference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeProvider;
