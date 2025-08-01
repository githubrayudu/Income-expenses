 // Auth check
    const checkAuth = () => {
      const loggedIn = localStorage.getItem("loggedin");
      if (loggedIn) {
        const username = localStorage.getItem("username");
        document.getElementById("profileName").style.display = "block";
        document.getElementById("userNameDisplay").textContent = username;
      } else {
        window.location.href = "index.html";
      }
    };

    checkAuth();

document.addEventListener("DOMContentLoaded", () => {




  

      // To update the current date and time dynamically
function updateDateTime() {
  const date = new Date();
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('date').textContent = date.toLocaleDateString(undefined, options);
  
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const timeStr = `${hours}:${minutes} ${ampm}`;
  document.getElementById('time').textContent = timeStr;
}
// Update the date and time every second
setInterval(updateDateTime, 1000);
updateDateTime(); // Initial call to set the date and time

});


// Clock update function
  function updateClock() {
    const now = new Date();

    const day = now.getDate().toString().padStart(2, "0");
    const monthNames = [
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // Fix hour '0' to 12

    const time = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
    const formatted = `${day} ${month} ${year} ${time}`;

    // Update clock element
    const clockElement = document.getElementById("clock");
    if (clockElement) {
      clockElement.textContent = formatted;
    }
  }

  // Call updateClock immediately and set interval to update every second
  setInterval(updateClock, 1000);  // Update every second
  updateClock();  // Initialize clock immediately
