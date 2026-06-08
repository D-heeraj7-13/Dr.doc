"use client";
import {createTestConflict} from "../utils/createConflict"; // Import the function to create conflict
import cors from "cors"; 
import { Table } from "antd"; 

import { useState } from "react"; 
import db, { remoteDB } from "../src/lib/db";

export default function Home() {

  const [temperature, setTemperature] = useState(null); 
 const [records, setRecords] = useState<any[]>([]);

  async function getWeather() {
    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&current_weather=true"
      );
      const data = await response.json();

      console.log("Weather API Response", data);

      // ✅ Update the state with the fetched data
      if (data.current_weather) {
        setTemperature(data.current_weather.temperature);
      }
      
      await db.put({
        _id: Date.now().toString(),
        weather: data,
        createdAt: new Date().toISOString(),
      });

      console.log("Saved to PouchDB");
    } catch (error) {
      console.error(error);
    }
  }

  async function showDocs() {
  const docs = await db.allDocs({ include_docs: true });

  console.log("All Docs", docs.rows);

  const tableData = docs.rows.map((row) => ({
    key: row.id,
    id: row.id,
    createdAt: (row.doc as any)?.createdAt,
    temperature: (row.doc as any)?.weather?.current_weather?.temperature ?? "N/A",
  }));

  setRecords(tableData);
}
  async function saveToCouchDB() {
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&current_weather=true"
    );

    const data = await response.json();

    const result = await remoteDB.put({
      _id: Date.now().toString(),
      weather: data,
      createdAt: new Date().toISOString(),
    });

    console.log("Saved directly to CouchDB", result);
  } catch (error) {
    console.error("CouchDB Save Error", error);
  }
}
const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
  },
  {
    title: "Temperature",
    dataIndex: "temperature",
    key: "temperature",
  },
];
  // ✅ Rule 2: ALL HTML rendering must happen inside this return statement
  return (
    <div style={{ padding: 20 }}>
      <h1>Weather Test</h1>

      {/* ✅ Conditional rendering lives here in the UI layer */}
      {temperature !== null ? (
        <h3>Current Temperature: {temperature}°C</h3>
      ) : (
        <p>No data loaded yet. Click the button below.</p>
      )}

      <button onClick={getWeather}>
        Get Weather
      </button>

      <button onClick={showDocs} style={{ marginLeft: 10 }}>
  Show Docs
</button>

<button
  onClick={createTestConflict}
  style={{ marginLeft: 10 }}
>
  Save Direct To CouchDB
</button>
<Table
  columns={columns}
  dataSource={records}
  virtual
  scroll={{ x: 2000, y: 500 }}
/>    </div>
  );
}

 