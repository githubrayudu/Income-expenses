/*
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Example credentials (for demo only)
  const validUsername = "admin";
  const validPassword = "1111";

  if (username === validUsername && password === validPassword) {
    localStorage.setItem('loggedin', 'true');
    window.location.href = "dashboard.html"; // Redirect to a dashboard page
  } else {
    document.getElementById("message").innerText = "Invalid username or password.";
  }
}




*/

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://localhost/Ei_backend/api/login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  const result = await response.json();

  if (result.success) {
    localStorage.setItem('loggedin', 'true');
    document.getElementById('message').innerText = 'Login successful!';
     window.location.href = "dashboard.html"; // Redirect to a dashboard page
  } else {
    document.getElementById('message').innerText = 'Invalid username or password.';
  }

  
});

