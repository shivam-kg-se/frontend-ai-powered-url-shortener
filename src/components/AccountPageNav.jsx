import { NavLink } from "react-router-dom";
import { FiShield, FiUser } from "react-icons/fi";

const AccountPageNav = () => (
  <nav className="account-page-nav" aria-label="Account settings">
    <NavLink
      className={({ isActive }) => `account-page-nav-link${isActive ? " is-active" : ""}`}
      end
      to="/profile"
    >
      <FiUser aria-hidden="true" />
      Profile
    </NavLink>
    <NavLink
      className={({ isActive }) => `account-page-nav-link${isActive ? " is-active" : ""}`}
      to="/settings"
    >
      <FiShield aria-hidden="true" />
      Security
    </NavLink>
  </nav>
);

export default AccountPageNav;
