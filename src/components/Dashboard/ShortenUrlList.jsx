import PropTypes from "prop-types";
import ShortenItem from "./ShortenItem";

const ShortenUrlList = ({ data }) => (
  <div className="links-table-shell">
    <table className="links-table">
      <thead>
        <tr>
          <th scope="col">Short URL</th>
          <th scope="col">Destination</th>
          <th scope="col">Clicks</th>
          <th scope="col">Created</th>
          <th scope="col"><span className="visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <ShortenItem key={item.id ?? item.shortUrl} {...item} />
        ))}
      </tbody>
    </table>
  </div>
);

ShortenUrlList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ShortenUrlList;
