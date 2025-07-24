// function checkAuth(){
//   if (localStorage.getItem('loggedin')!=='true') {
//     window.location.href = 'login.html';
//   }
// }



 // Check if the user is logged in
      const checkAuth = () => {
        const loggedIn = localStorage.getItem("loggedin");
        if (loggedIn) {
          const username = localStorage.getItem("username");
          // Display profile name at the top right
          document.getElementById("profileName").style.display = "block";
          document.getElementById("userNameDisplay").textContent = username;
        } else {
          window.location.href = "index.html"; // Redirect to login if not logged in
        }
      };