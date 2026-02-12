
import mongoose from "mongoose";


interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}


declare global {
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Por favor, define la variable de entorno MONGODB_URI");
}


let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

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