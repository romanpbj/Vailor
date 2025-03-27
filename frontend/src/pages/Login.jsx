import { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import "../Login.css"

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext)

  function handleAccountLogin(e) {
    e.preventDefault();
    const loginUserData = { username, password };
    axios
      .post(`${API_URL}/api/login`, loginUserData)
      .then((response) => {
        loginUser(response.data)
        console.log("Login successful. Axios defaults:", axios.defaults.headers.common);
        navigate("/profile");
      })
      .catch((err) => {
        alert("Error logging in: " + err.message);
      });
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleAccountLogin}>
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
            <label>Password: </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;