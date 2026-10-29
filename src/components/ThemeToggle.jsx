import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../contextApi/ThemeContextValue";

const ThemeToggle = () => {
  const { theme, setThemePreference } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="icon-button theme-icon-button"
      onClick={() => setThemePreference(nextTheme)}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      {theme === "dark"
        ? <FiMoon aria-hidden="true" />
        : <FiSun aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;
