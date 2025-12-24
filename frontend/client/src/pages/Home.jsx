// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-green-100 px-6">
      <div className="max-w-3xl w-full text-center">

        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-6">
          {/* Jotter Logo SVG */}
          <svg
            width="90"
            height="90"
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Jotter Logo"
            className="mb-4"
          >
            {/* J Base */}
            <path
              d="M60 10
                 c-6 0-10 4-10 10v52
                 c0 14-6 20-16 20
                 h-4
                 v14
                 h6
                 c22 0 34-12 34-36V20
                 c0-6-4-10-10-10z"
              fill="#2F3A40"
            />

            {/* Ink Stroke */}
            <path
              d="M18 62
                 C36 40, 72 32, 102 38
                 L96 46
                 C70 42, 44 50, 28 70
                 Z"
              fill="#4CAF50"
            />
          </svg>

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
