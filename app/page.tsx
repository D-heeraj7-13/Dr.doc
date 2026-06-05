"use client";

import db from "../src/lib/db";

export default function Home() {
  async function getWeather() {
    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&current_weather=true"
      );

      const data = await response.json();

      console.log("Weather API Response");
      console.log(data);
      
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
    const docs = await db.allDocs({
      include_docs: true,
    });

    console.log("All Docs");
    console.log(docs.rows);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Weather Test</h1>

      <button onClick={getWeather}>
        Get Weather
      </button>

      <button
        onClick={showDocs}
        style={{ marginLeft: 10 }}
      >
        Show Docs
      </button>
    </div>
  );
}