import PropTypes from "prop-types";
const Card = ({ title, desc }) => {
  return (
    <article className="feature-card">
      <h2>{title}</h2>
      <p>{desc}</p>
    </article>
  );
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
};

export default Card;