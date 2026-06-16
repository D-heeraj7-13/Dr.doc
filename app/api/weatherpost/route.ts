import { NextResponse } from "next/server";
import { pool } from "@/src/lib/postgres";

export async function GET() {
  const result = await pool.query(`
    SELECT *
    FROM weather_records
    ORDER BY id DESC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const body = await req.json();
      console.log("BODY", body);

  const result = await pool.query(
    `
    INSERT INTO weather_records
    (
      created_at,
      temperature
    )
    VALUES
    (
      $1,
      $2
    )
    RETURNING *
    `,
    [
      body.createdAt,
      body.temperature,
    ]
  );

  return NextResponse.json(result.rows[0]);
}