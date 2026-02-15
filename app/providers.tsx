"use client";

import { SessionProvider } from "next-auth/react";

// Session provider for authenticated routes.
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};