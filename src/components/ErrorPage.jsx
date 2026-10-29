import PropTypes from "prop-types";
import { FiAlertTriangle, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ErrorPage = ({ message }) => {
    const navigate = useNavigate();
    return (
      <main className="error-page">
          <span className="error-icon"><FiAlertTriangle aria-hidden="true" /></span>
          <h1>We hit a snag.</h1>
          <p>{message || "Something went wrong while loading this page. You can return to the Linkora-AI home page."}</p>
          <button onClick={() => navigate("/")} className="button-primary" type="button">
              <FiArrowLeft aria-hidden="true" /> Back to Linkora-AI
          </button>
      </main>
  )
}

ErrorPage.propTypes = {
    message: PropTypes.string,
};

export default ErrorPage