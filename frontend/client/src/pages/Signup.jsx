import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // VERY IMPORTANT
    });
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  if (loading) return; // 🔒 block multiple clicks
  setLoading(true);

  try {
    const res = await axios.post(
      "https://jotter-backend-l0ki.onrender.com/api/users/register",
      formData
    );

    const { token, id, fullName, email } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({ id, fullName, email })
    );

    navigate("/");
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert(err.response?.data?.message || "Signup failed");
  } finally {
    setLoading(false); // ✅ always reset
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Signup</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-2 border rounded"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-2 border rounded"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
            minLength={6}
          />

          <button
  type="submit"
  disabled={loading}
  className={`w-full py-2 rounded text-white transition
    ${
      loading
        ? "bg-green-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700"
    }
  `}
>
  {loading ? "Creating account..." : "Signup"}
</button>

        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
