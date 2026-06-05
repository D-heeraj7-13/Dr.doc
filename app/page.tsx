"use client";

import { useState } from "react"; // Fixed import
import db from "../src/lib/db";

export default function Home() {

  const [temperature, setTemperature] = useState(null);

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
  }

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
    </div>
  );
}