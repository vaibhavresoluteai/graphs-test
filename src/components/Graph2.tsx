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
        enabled: true, // Enables zooming
        type: 'x', // Enable horizontal zooming
        autoScaleYaxis: true, // Automatically adjust Y axis on zoom
      },
      toolbar: {
        autoSelected: 'zoom', // Automatically select zoom tool
      },
    },
    xaxis: {
      categories: [],
      labels: {
        show: true, // Display x-axis labels
        rotate: -45, // Rotate labels for better readability
        style: {
          fontSize: '10px', // Adjust label font size to fit more labels
        },
      },
      tickAmount: 10, // Set the number of ticks on x-axis
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
        formatter: function (value: number) {
          return value.toFixed(2); // Round Y-axis values to 2 decimal places
        },
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/milk_spillage.csv');
      const data = await response.text();

      // Parse CSV using PapaParse
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
    // Extract the detection start time for x-axis categories, skipping every 20th frame
    const categories = data
      .filter((_, index) => index % 20 === 0) // Skip every 20th frame
      .map((row: CSVRow, index: number) => row['Detection Start time'] || `Time ${index + 1}`);

    // Extract and filter the valid values for Approx. Wastage Percentage
    const values = data
      .filter((_, index) => index % 50 === 0) // Skip every 50th frame
      .map((row: CSVRow) => {
        const value = parseFloat(row['Approx. Wastage Percentage']);
        return isNaN(value) ? null : value; // Handle NaN by setting null
      })
      .filter((value: any) => value !== null); // Filter out invalid values

    setChartData([
      {
        name: 'Wastage Percentage',
        data: values,
      },
    ]);

    // Set options for the chart, including the x-axis categories
    setOptions((prevOptions: any) => ({
      ...prevOptions,
      xaxis: {
        categories,
      },
    }));
  };

  return (
    <div>
      {chartData.length > 0 ? (
        <ApexCharts
          options={options}
          series={chartData}
          type="line"
          height={350}
        />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default GraphWithCSV;
