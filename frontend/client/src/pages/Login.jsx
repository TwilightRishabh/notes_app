import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


const handleLogin = async (e) => {
  e.preventDefault();

  if (loading) return; // 🔒 block multiple clicks
  setLoading(true);

  try {
    const res = await axios.post(
      "https://jotter-backend-l0ki.onrender.com/api/users/login",
      { email, password }
    );

    // save token
    localStorage.setItem("token", res.data.token);

    // redirect to notes
    navigate("/notes");
  } catch (error) {
    alert(error.response?.data?.message || "Login failed");
  } finally {
    setLoading(false); // ✅ ALWAYS reset
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <button
  type="submit"
  disabled={loading}
  className={`w-full py-2 rounded-md text-white transition
    ${
      loading
        ? "bg-green-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700"
    }
  `}
>
  {loading ? "Logging in..." : "Login"}
</button>

        </form>

        {/* signup redirect */}
        <p className="mt-4 text-sm text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
