import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      setError("");
      const signupResponse = await fetch(
        "https://nexagpt.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        },
      );

      const signupData = await signupResponse.json();
      if (!signupResponse.ok) {
        setError(signupData.message);
        return;
      }

      // Automatically log in
      const loginResponse = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const loginData = await loginResponse.json();

      localStorage.setItem("token", loginData.token);

      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Signup failed");
    }
  };

  return (
    <div className="authContainer">
      <div className="authBox">
        <h1 className="authTitle">Create Account</h1>

        <input
          className="authInput"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="authInput"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="authInput"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="authButton" onClick={handleSignup}>
          Sign Up
        </button>

        {error && <p className="errorText">{error}</p>}
        <p className="authLink">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
