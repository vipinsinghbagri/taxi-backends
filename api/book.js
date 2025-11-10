import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method Not Allowed" });

  try {
    const body = req.body;

    const doc = {
      name: body.name || "",
      phone: body.phone || "",
      pickup: body.pickup || "",
      drop: body.drop || "",
      datetime: body.datetime || "",
      createdAt: new Date(),
    };

    const client = await clientPromise;
    const db = client.db("taxi_db");
    const col = db.collection("bookings");
    const result = await col.insertOne(doc);

    res.status(200).json({ ok: true, id: result.insertedId });
  } catch (err) {
    console.error("❌ Mongo error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
