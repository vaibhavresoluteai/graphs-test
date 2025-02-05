import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import ApexCharts from 'react-apexcharts';

interface CSVRow {
  'Detection Start time': string;
  'Approx. Wastage Percentage': string;
  'Total detection time': string;
  'Alert status': string;
}

const GraphWithCSV: React.FC = () => {
  const [chartData, setChartData] = useState<any>([]);
  const [options, setOptions] = useState<any>({
    chart: {
      id: 'line-chart',
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true,
      },
      toolbar: {
        autoSelected: 'zoom',
      },
    },
    xaxis: {
      categories: [],
      labels: {
        show: true,
        rotate: -45,
        style: {
          fontSize: '10px',
        },
      },
      tickAmount: 10,
    },
    title: {
      text: 'Approx. Wastage Percentage Over Time',
      align: 'center',
    },
    yaxis: {
      title: {
        text: 'Wastage Percentage',
      },
      labels: {
        formatter: (value: number) => value.toFixed(2),
      },
    },
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/milk_spillage.csv');
        if (!response.ok) throw new Error('Failed to fetch CSV data');
        const data = await response.text();

        Papa.parse<CSVRow>(data, {
          complete: (result) => {
            processData(result.data);
          },
          header: true,
          skipEmptyLines: true,
        });
      } catch (err) {
        setError((err as Error ).message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processData = (data: CSVRow[]) => {
    // Extract all detection start times for x-axis categories
    const categories = data.map((row: CSVRow, index: number) => row['Detection Start time'] || `Time ${index + 1}`);

    // Extract all Approx. Wastage Percentage values for y-axis, handling invalid values
    const values = data.map((row: CSVRow) => {
      const value = parseFloat(row['Approx. Wastage Percentage']);
      return isNaN(value) ? null : value;
    }).filter((value: any) => value !== null);

    setChartData([
      {
        name: 'Wastage Percentage',
        data: values,
      },
    ]);

    setOptions((prevOptions: any) => ({
      ...prevOptions,
      xaxis: {
        categories,
      },
    }));

    setLoading(false);
  };

  return (
    <div>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : chartData.length > 0 ? (
        <ApexCharts
          options={options}
          series={chartData}
          type="line"
          height={350}
        />
      ) : (
        <p>No data available to display</p>
      )}
    </div>
  );
};

export default GraphWithCSV;
