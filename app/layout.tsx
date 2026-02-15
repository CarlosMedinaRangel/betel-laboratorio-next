import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers"; 
import "./globals.css"; 

const inter = Inter({ subsets: ["latin"] });

// Global metadata for the app shell.
export const metadata: Metadata = {
  title: "Betel Laboratorio",
  description: "Sistema de gestión",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light">
      <head>
        {/* Global icon font for Material Symbols. */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} antialiased bg-background-light text-slate-900`}>

        {/* Providers wrap all routes to share session state. */}
        <Providers>
          {children}
        </Providers>
        
      </body>
    </html>
  );
}