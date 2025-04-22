import React from "react";
import { loginWithGoogle } from "./firebase";

function LoginPage() {
  const handleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      const user = result.user;
      alert("Welcome, " + user.displayName);
      console.log("User email:", user.email);

      // ✅ 登录后跳转 Dashboard 页面
      window.location.href = "/dashboard.html";
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>🔐 Login to Utopia ERP</h2>
      <button
        onClick={handleLogin}
        style={{ fontSize: 18, padding: "10px 20px" }}
      >
        Sign in with Google
      </button>
    </div>
  );
}

export default LoginPage;
