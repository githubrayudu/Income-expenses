
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const localEndPoint = 'http://localhost/Ei_backend/api/login.php';
  const response = await fetch(localEndPoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  const result = await response.json();

  if (result.success) {
    localStorage.setItem('loggedin', 'true');
    localStorage.setItem('username',username)
    document.getElementById('message').innerText = 'Login successful!';
     // Redirect to a dashboard page
    
             window.location.assign("dashboard.html");
  } else {
    document.getElementById('message').innerText = 'Invalid username or password.';
  }

  
});

