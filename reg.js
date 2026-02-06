document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const fullname = document.getElementById("fullname").value;
  const email = document.getElementById("email").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;
  const role = document.getElementById("role").value; // company / creator

  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  const res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: fullname,
      email,
      username,
      password,
      role
    })
  });

  const data = await res.json();
  alert(data.message);

  if (data.message === "User registered successfully!") {
    window.location.href = "indexlogin.html";
  }
});
