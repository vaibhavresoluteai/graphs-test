import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartOptions } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

interface CSVRow {
  'Detection Start time': string;
  'Approx. Wastage Percentage': string;
  'Total detection time': string;
  'Alert status': string;
}

const GraphWithCSV2: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [options, setOptions] = useState<ChartOptions<'line'>>({
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.raw} %`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Detection Start Time',
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10, // Adjust the number of ticks to avoid cluttering
        },
        min: 0,
      },
      y: {
        title: {
          display: true,
          text: 'Wastage Percentage',
        },
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/milk_spillage.csv');
      const data = await response.text();

      Papa.parse<CSVRow>(data, {
        complete: (result) => {
          processData(result.data);
        },
        header: true,
        skipEmptyLines: true,
      });
    };

    fetchData();
  }, []);

  // Process the parsed CSV data into chart data format
  const processData = (data: CSVRow[]) => {
    // Skip every 12th row from the data
    const filteredData = data.filter((_, index) => (index + 1) % 20 !== 0);

    const labels = filteredData.map((row) => row['Detection Start time']);
    const values = filteredData.map((row) => {
      const value = parseFloat(row['Approx. Wastage Percentage']);
      return isNaN(value) ? 0 : value;
    });

    setChartData({
      labels,
      datasets: [
        {
          label: 'Approx. Wastage Percentage',
          data: values,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    });
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      {chartData ? (
        <div style={{ width: '100%' }}> {/* For debugging, set a fixed width first */}
          <Line data={chartData} options={options} />
        </div>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default GraphWithCSV2;
