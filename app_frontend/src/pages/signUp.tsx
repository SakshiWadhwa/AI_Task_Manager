import { useState } from "react";
import { useRouter } from "next/router";
import { registerUser } from "../services/authService";
const SignUp = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2 , setpassword2] = useState("");
  const [error, setError] = useState("");
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) {
      setError("Passwords do not match!");
      return;
    }
    try {
      await registerUser(email, password, password2);
      router.push("/login"); // Redirect to login page after successful registration
    } catch (err) {
      setError("Failed to register. Try again.");
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      <div className="bg-white p-8 rounded shadow-lg w-80">
        <h2 className="text-2xl mb-4 text-center">Sign Up</h2>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-600">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-600">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-600">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={password2}
              onChange={(e) => setpassword2(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-2"
            />
          </div>
          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Login
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};
export default SignUp;