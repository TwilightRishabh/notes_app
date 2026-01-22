// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import JotterLogo from "../components/branding/JotterLogo";

function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-green-100 px-6">
      <div className="max-w-3xl w-full text-center">

        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-6">
          {/* Jotter Logo SVG */}
          <JotterLogo size={60} />

          <h1 className="text-4xl font-bold text-gray-900">
            Jotter
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-gray-600 text-lg max-w-xl mx-auto mb-10">
          A calm, focused space to capture thoughts, ideas, and notes —
          without distractions.
        </p>

        {/* CTA Section */}
        {!token ? (
          <div className="flex justify-center gap-4">
            {/* Login */}
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-md bg-green-600 text-white
                         hover:bg-green-700 transition"
            >
              Login
            </Link>

            {/* Signup */}
            <Link
              to="/signup"
              className="px-6 py-2.5 rounded-md border border-gray-300
                         text-gray-700 hover:bg-gray-100 transition"
            >
              Signup
            </Link>
          </div>
        ) : (
          <Link
            to="/notes"
            className="inline-block px-8 py-3 rounded-md
                       bg-green-600 text-white
                       hover:bg-green-700 transition"
          >
            Go to your notes
          </Link>
        )}
      </div>
    </div>
  );
}

export default Home;