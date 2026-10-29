import { lazy, Suspense } from "react";
import PropTypes from "prop-types";

const Graph = lazy(() => import("./Graph"));

const LazyGraph = ({ graphData }) => (
  <Suspense fallback={<div className="chart-loading" role="status">Loading chart…</div>}>
    <Graph graphData={graphData} />
  </Suspense>
);

LazyGraph.propTypes = {
  graphData: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string,
  ]),
};

LazyGraph.defaultProps = {
  graphData: [],
};

export default LazyGraph;
