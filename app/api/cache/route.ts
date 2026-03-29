import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET() {
  console.log("➡️ Request came in");

  const data = await redis.get("user:1");

  if (data) {
    console.log("✅ Cache HIT");

    return NextResponse.json({
      source: "redis",
      data: JSON.parse(data),
    });
  }

  console.log("❌ Cache MISS → fetching from DB");

  // simulate slow DB
  await new Promise((res) => setTimeout(res, 2000));

  const fakeDB = {
    id: 1,
    name: "John Doe",
    time: new Date().toISOString(),
  };

  console.log("💾 Saving to Redis");

  await redis.set("user:1", JSON.stringify(fakeDB), {
    EX: 20,
  });

  return NextResponse.json({
    source: "db",
    data: fakeDB,
  });
}