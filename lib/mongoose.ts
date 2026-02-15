
import mongoose from "mongoose";

// Cache shape to reuse a single connection across reloads.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}


// Extend the Node global to store the cache safely.
declare global {
  var mongoose: MongooseCache | undefined;
}

// Read connection string once at module init.
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Por favor, define la variable de entorno MONGODB_URI");
}


// Initialize cache if needed (supports hot reload).
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Main helper used by API routes and auth.
const connectionToDatabase = async () => {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
    console.log("Conexión a MongoDB establecida ✅");
  } catch (error) {
    cached!.promise = null;
    console.error("Error al conectar a MongoDB: ❌", error);
    throw error;
  }

  return cached!.conn;
};

export default connectionToDatabase;