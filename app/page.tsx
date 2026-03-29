"use client";

import { useState } from "react";

type ApiResponse = {
  source: string;
  data: {
    id: number;
    name: string;
    time: string;
  };
};

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    const res = await fetch("/api/cache");
    const json = await res.json();

    setData(json);
    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>🚀 Redis Demo</h1>

      <button onClick={fetchData}>
        Fetch Data
      </button>

      {loading && <p>Loading...</p>}

      {data && (
        <div>
          <p><b>Source:</b> {data.source}</p>
          <pre>{JSON.stringify(data.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}