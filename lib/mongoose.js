import mongoose from "mongoose";
const coneectionToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conexión a MongoDB establecida");
  }catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  }
}

export default coneectionToDatabase;
