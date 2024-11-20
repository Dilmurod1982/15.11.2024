import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });

      const { accessToken, refreshToken } = response.data;

      // Сохраняем токены
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      alert("Login successful!");
    } catch (err) {
      setError("Invalid credentials");
      console.error(err);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await axios.post("http://localhost:5000/api/token", {
        refreshToken,
      });

      const { accessToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
    } catch (err) {
      console.error("Failed to refresh token:", err);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={refreshAccessToken}>Refresh Token</button>
    </div>
  );
};

export default Login;
