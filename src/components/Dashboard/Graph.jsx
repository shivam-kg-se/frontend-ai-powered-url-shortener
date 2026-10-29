import dayjs from "dayjs";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  Legend,
  Filler
);

const normalizeData = (source) => {
  let records = source;

  if (typeof records === "string") {
    try {
      records = JSON.parse(records);
    } catch {
      return [];
    }
  }

  if (records && !Array.isArray(records) && typeof records === "object") {
    if (Array.isArray(records.data)) records = records.data;
    else if (Array.isArray(records.analytics)) records = records.analytics;
    else records = Object.entries(records).map(([clickDate, count]) => ({ clickDate, count }));
  }

  if (!Array.isArray(records)) return [];

  return records
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
};

const Graph = ({ graphData }) => {
  const records = normalizeData(graphData);
  const styles = getComputedStyle(document.documentElement);
  const textColor = styles.getPropertyValue("--muted").trim() || "#77717f";
  const gridColor = styles.getPropertyValue("--chart-grid").trim() || "#e8e5ee";
  const accentColor = styles.getPropertyValue("--chart-bar").trim() || "#755be2";
  const total = records.reduce((sum, item) => sum + item.count, 0);

  const data = {
    labels: records.map(({ clickDate }) => (
      dayjs(clickDate).isValid() ? dayjs(clickDate).format("MMM D") : clickDate
    )),
    datasets: [
      {
        label: "Clicks",
        data: records.map(({ count }) => count),
        borderColor: accentColor,
        backgroundColor: `${accentColor}24`,
        borderWidth: 2.5,
        pointRadius: records.length > 40 ? 0 : 3,
        pointHoverRadius: 5,
        pointBackgroundColor: accentColor,
        pointBorderColor: styles.getPropertyValue("--surface").trim() || "#fff",
        pointBorderWidth: 2,
        tension: 0.34,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300,
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: false,
        callbacks: {
          title: (items) => records[items[0]?.dataIndex]?.clickDate || "",
          label: (item) => `${Number(item.raw).toLocaleString()} clicks`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: textColor, precision: 0, maxTicksLimit: 5 },
        grid: { color: gridColor, drawBorder: false },
        border: { display: false },
      },
      x: {
        ticks: { color: textColor, maxTicksLimit: 8, maxRotation: 0 },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  if (!records.length) {
    return (
      <div className="chart-empty">
        <h3>No click activity yet</h3>
        <p>Click totals will appear here when the analytics service returns data.</p>
      </div>
    );
  }

  return (
    <div className="chart-visualization">
      <div
        className="chart-canvas"
        role="img"
        aria-label={`Line chart of daily clicks, ${records.length} data points, ${total.toLocaleString()} total clicks.`}
      >
        <Line data={data} options={options} />
      </div>
      <details className="chart-data-details">
        <summary>View daily click data</summary>
        <div className="chart-data-table-wrap">
          <table className="chart-data-table">
            <thead><tr><th>Date</th><th>Clicks</th></tr></thead>
            <tbody>
              {records.map((item) => (
                <tr key={item.clickDate}>
                  <td>{dayjs(item.clickDate).isValid() ? dayjs(item.clickDate).format("MMM D, YYYY") : item.clickDate}</td>
                  <td>{item.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};

Graph.propTypes = {
  graphData: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string,
  ]),
};

Graph.defaultProps = {
  graphData: [],
};

export default Graph;
