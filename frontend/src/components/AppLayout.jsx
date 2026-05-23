import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
export default function AppLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }} dir="rtl">
      <Navbar />
      <main style={{ flexGrow: 1, background: "#FAF7F0" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}