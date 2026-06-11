import { useState } from "react";
import api from "../services/api";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {

    try {

      const res = await api.post(
        "/auth/login",
        {
          email,
          password
        }
      );

      console.log("LOGIN RESPONSE:", res.data);

      localStorage.setItem(
        "token",
        res.data.token
      );
      localStorage.setItem(
        "username",
        res.data.username
      );

      localStorage.setItem(
        "userId",
        res.data.userId
      );

      window.location.href = "/dashboard";

    } catch (error) {

      console.error(error);

    }

  };

  return (
    <div>
      <h1>Login</h1>

      <input
        placeholder="Email"
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button onClick={login}>
        Login
      </button>
    </div>
  );
}

export default Login;