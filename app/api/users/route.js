// api/users/route.js
import connectionToDatabase from "../../../lib/mongoose";
import User from "../../../models/users";
import { NextResponse } from "next/server"; // Corrige el typo NextReponse
import bcrypt from "bcryptjs"; // Importar bcrypt

export async function POST(request) {
    try {
        await connectionToDatabase();
        const { name, email, password, role } = await request.json();

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
             return NextResponse.json({ message: "El usuario ya existe" }, { status: 400 });
        }

        // ENCRIPTAR CONTRASEÑA 🔐
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword, // Guardamos la encriptada
            role: role || "user",
        });

        await newUser.save();
        return NextResponse.json({ message: "Usuario creado exitosamente" }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error al crear usuario" }, { status: 500 });
    }
}