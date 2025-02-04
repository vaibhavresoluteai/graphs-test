import React, { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import Papa from "papaparse";

interface DataPoint {
  x: number; // Total Detection Time
  y: number; // Approx. Wastage Percentage
}

const LineChart: React.FC = () => {
  const [chartData, setChartData] = useState<{ id: string; data: DataPoint[] }[]>([]);
  const [dataLength, setDataLength] = useState<number>(0); // Store data length

  useEffect(() => {
    fetch("/milk_spillage.csv") // Ensure 'data.csv' is in the 'public' folder
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (result) => {
            const parsedData: DataPoint[] = result.data
              .map((row: any, index: number) => {
                if (!row["Approx. Wastage Percentage"] || !row["Total detection time"]) return null; // Skip missing data

                return {
                  x: parseFloat(row["Total detection time"]), // Use 'Total detection time' for X-Axis
                  y: parseFloat(row["Approx. Wastage Percentage"])*100 || 0, // Ensure Y-axis is valid
                };
              })
              .filter((item) => item !== null) as DataPoint[];

            if (parsedData.length > 0) {
              setChartData([{ id: "Wastage Trend", data: parsedData }]);
              setDataLength(parsedData.length); // Store length for JSX use
            }
          },
        });
      })
      .catch((error) => console.error("Error loading CSV:", error));
  }, []);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ minWidth: "1000px", height: "400px" }}>
        {chartData.length > 0 ? (
          <ResponsiveLine
            data={chartData}
            margin={{ top: 50, right: 30, bottom: 50, left: 60 }}
            xScale={{ type: "linear", min: 1 }} // Ensures correct indexing based on 'Total detection time'
            yScale={{ type: "linear", min: "auto", max: "auto" }}
            axisBottom={{
              legend: "Total Detection Time",
              legendOffset: 36,
              legendPosition: "middle",
              tickValues: dataLength > 10 ? 5 : dataLength, // Use stored length
            }}
            axisLeft={{
              legend: "Wastage Percentage",
              legendOffset: -50,
              legendPosition: "middle",
            }}
            colors={["#ff6347"]}
            pointSize={8}
            pointBorderWidth={2}
            useMesh={true}
            enableArea={true}
            enableGridX={false}
            curve="monotoneX" // Smooth curves
          />
        ) : (
          <p>Loading data or no valid data found...</p>
        )}
      </div>
    </div>
  );
};

export default LineChart;
