import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import JotterLogo from "../";



export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-green-600 after:w-full"
      : "text-gray-600 hover:text-green-600 after:w-0";

  return (
    <nav className="w-full bg-emerald-50 border-b border-gray-300 shadow-gray-200  ">
      <div className="w-full flex items-center justify-between px-6 py-4">

        {/* ---------------- LEFT : LOGO + BRAND ---------------- */}
        <Link
          to="/"
          className="flex items-center gap-3 font-semibold text-lg text-gray-900 group"
        >
          {/* JOTTER SVG LOGO */}
          <JotterLogo size={34} />


          {/* BRAND NAME */}
          <span className="tracking-tight">Jotter</span>
        </Link>

        {/* ---------------- RIGHT : ACTIONS ---------------- */}
        <div className="flex items-center gap-7">
          {!token ? (
            <>
              <Link
                to="/login"
                className={`relative transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-green-500 after:transition-all ${isActive(
                  "/login"
                )}`}
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="px-4 py-1.5 rounded-md border border-green-600 text-green-600 hover:bg-green-50 hover:scale-[1.03] transition"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/notes"
                className={`relative transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-green-500 after:transition-all ${isActive(
                  "/notes"
                )}`}
              >
                Notes
                </Link>
                
                <Link to="/archived" className={`relative transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-green-500 after:transition-all ${isActive(
                  "/archived"
                )}`}>
                  Archived
                </Link>

                <Link to="/trash" className={`relative transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-green-500 after:transition-all ${isActive(
                  "/trash"
                )}`}>
                  Trash
                </Link>



              <button
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-600 hover:bg-red-50 hover:scale-[1.03] transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}