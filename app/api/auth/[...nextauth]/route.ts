import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "../../../../lib/mongoose";
import User from "../../../../models/users";
import bcrypt from "bcryptjs";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // 1. Aquí solucionamos 'credentials' asignándole el tipo 'any' o 'Record'
      async authorize(credentials: any) {
        await connectToDatabase();

        // 1. Verificar si el usuario existe
        const user = await User.findOne({ email: credentials?.email });
        if (!user) throw new Error("Usuario no encontrado");

        // 2. Verificar contraseña
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordCorrect) throw new Error("Contraseña incorrecta");

        // 3. Retornar objeto usuario
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // 2. Aquí solucionamos 'token' y 'user' definiendo sus tipos
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    // 3. También es probable que 'session' te pida tipos
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };