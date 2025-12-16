import React from 'react'
import { Link, useNavigate } from 'react-router-dom'


export default function NavBar(){
const navigate = useNavigate();
const token = localStorage.getItem('token');


const handleLogout = () => {
localStorage.removeItem('token');
localStorage.removeItem('user');
navigate('/login');
}


return (
<nav className="w-full border-b bg-white">
<div className="container-max mx-auto flex items-center justify-between px-6 py-3">
<div>
<Link to="/" className="text-gray-700">Home</Link>
</div>


<div className="flex items-center gap-4">
{!token ? (
<>
<Link to="/login" className="text-gray-700">Login</Link>
<Link to="/signup" className="text-gray-700">Signup</Link>
</>
) : (
<>
<Link to="/notes" className="text-gray-700">Notes</Link>
<button onClick={handleLogout} className="bg-gray-100 border px-3 py-1 rounded">Logout</button>
</>
)}
</div>
</div>
</nav>
)
}