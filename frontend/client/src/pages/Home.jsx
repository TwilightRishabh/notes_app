// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to Notes App 📝
      </h1>

      <p className="text-gray-600 mb-6 max-w-md">
        A simple MERN notes app where you can securely create, edit,
        and manage your notes.
      </p>

      {!token ? (
        <div className="flex gap-4">
          {/* Login */}
          <Link
            to="/login"
            className="px-6 py-2 bg-green-600 text-white rounded-md 
                       hover:bg-green-700 transition"
          >
            Login
          </Link>

          {/* Signup */}
          <Link
            to="/signup"
            className="px-6 py-2 border border-gray-300 rounded-md 
                       text-gray-700 hover:bg-gray-100 transition"
          >
            Signup
          </Link>
        </div>
      ) : (
        <Link
          to="/notes"
          className="px-6 py-2 bg-emerald-600 text-white rounded-md 
                     hover:bg-emerald-700 transition"
        >
          Go to Notes
        </Link>
      )}
    </div>
  );
}

export default Home;
