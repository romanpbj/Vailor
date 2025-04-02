import { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import "../SignUp.css"

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("")
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext)

  function handleAccountCreate(e) {
    e.preventDefault();
    const newUser = { username, email, password, adminKey };
    axios
      .post(`${API_URL}/api/signup`, newUser)
      .then((response) => {
        loginUser(response.data);
        navigate("/profile");
      })
      .catch((err) => {
        alert("Error making account: " + err.message);
      });
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Signup</h1>
        <form onSubmit={handleAccountCreate}>
          <div>
            <label>Username: </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Email: </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password: </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Admin Key: </label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
            />
          </div>
          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;