document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if(data.token){
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);

    // Redirect based on role
    if(data.user.role === "student"){
      window.location.href = "creator.html";   // Student dashboard
    } else {
      window.location.href = "company.html";   // Company dashboard
    }
  } else {
    alert(data.message);
  }
});
