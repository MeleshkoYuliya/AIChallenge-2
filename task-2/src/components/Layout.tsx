import { Navbar } from "./Navbar";
import { ReactNode } from "react";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-8 md:py-12">{children}</main>
    </div>
  );
};
