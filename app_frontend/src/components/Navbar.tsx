import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios"; // Import axios for API calls

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Hide Navbar on login page
    if (router.pathname === "/login") return;

    // Check if user is logged in
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, [router.pathname]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken"); // Ensure refresh token is stored

    try {
      if (refreshToken) {
        await axios.post("http://127.0.0.1:8000/user/logout/", {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }

    // Clear stored tokens and update state
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);

    // Redirect to login page
    router.push("/login");
  };

  // Don't show navbar on login page
  if (router.pathname === "/login") return null;

  return (
    <nav className="bg-gray-800 text-white py-4 flex justify-between px-4">
      <div>
        <Link href="/">Home</Link>
        <Link href="/tasks" className="ml-4">Tasks</Link>
        {isLoggedIn && <Link href="/assigned-tasks" className="ml-4">My Tasks</Link>}
      </div>
      <div>
        {isLoggedIn ? (
          <button onClick={handleLogout} className="text-white bg-red-500 px-4 py-2 rounded">
            Logout
          </button>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
