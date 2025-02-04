import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Papa from 'papaparse';

interface CSVRow {
  'Detection Start time': string;
  'Approx. Wastage Percentage': string;
  'Total detection time': string;
  'Alert status': string;
}

const Graph: React.FC = () => {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/milk_spillage.csv'); // Ensure data.csv is in the public folder
      const csvText = await response.text();

      // Parse CSV using PapaParse
      Papa.parse<CSVRow>(csvText, {
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
    // Filter and extract the Detection Start time and Approx. Wastage Percentage, skipping every 12th frame
    const filteredData = data.filter((_, index) => index % 20 === 0); // Skip every 12th frame

    // Extract the timestamps (x-axis categories)
    const categories = filteredData.map((row: CSVRow) => row['Detection Start time']);

    // Extract the wastage percentage (y-axis values)
    const values = filteredData.map((row: CSVRow) => {
      const value = parseFloat(row['Approx. Wastage Percentage']);
      return isNaN(value) ? null : value; // Handle NaN values
    }).filter((value: any) => value !== null); // Remove invalid values

    setData(
      categories.map((timestamp, index) => ({
        timestamp, // x-axis value
        wastagePercentage: values[index], // y-axis value
      }))
    );
  };

  return (
    <ResponsiveContainer height={300} width="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Line dataKey="wastagePercentage" strokeWidth={1} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Graph;
