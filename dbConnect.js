import { MongoClient, Db } from "mongodb";

const mongoclient = new MongoClient(process.env.MONGODB_URI);
export let clientPromise = mongoclient.connect().then((client) => client);
let db = null;

async function dbConnect() {
  try {
    const client = await mongoclient.connect();
    db = client.db("dashboard-db");
  } catch (e) {
    console.error("Error connecting to MongoDB", e);
    throw new Error("Failed to connect to MongoDB");
  }
}

dbConnect().catch((error) => {
  console.error("Error during database connection:", error);
});

export { db };
