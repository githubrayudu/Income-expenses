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

// Clock update function       // To update the current date and time dynamically
function updateClock() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const monthNames = [
    "January",    "February",    "March",    "April",    "May",
    "June",    "July",    "August",    "September",    "October",
    "November",    "December",
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

// the below update date is only for date with day and time shown in the box coloum

// Update current date and time every second
function updateDateTime() {
  const date = new Date();

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("date").textContent = date.toLocaleDateString(
    undefined,
    options
  );

  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  const timeStr = `${hours}:${minutes} ${ampm}`;
  document.getElementById("time").textContent = timeStr;
}

function updateGreeting() {
  const hours = new Date().getHours();
  let greeting;
  if (hours >= 5 && hours < 12) {
    greeting = "Good Morning";
  } else if (hours >= 12 && hours < 17) {
    greeting = "Good Afternoon";
  } else if (hours >= 17 && hours < 21) {
    greeting = "Good Evening";
  } else {
    greeting = "Good Night";
  }
  document.getElementById("greeting").innerText = greeting;
}

setInterval(updateClock, 1000); // Call updateClock immediately and set interval to update every second
updateClock(); // Initialize clock immediately
updateGreeting(); // Initialize Greeting

//Session timeout could this will logout the user if the users not uses application for some time 

let timeout;
const logoutAfter = 1 *60*1000 ; // 10 sec  for testing 

function resetTimer(){
  clearTimeout(timeout);
  timeout = setTimeout(logout , logoutAfter);

}
function logout(){
  alert("Session expired. Logging out .");
  window.location.href = 'index.html';
}
  //events to reset timer 
['click','mousemove','keypress'].forEach(evt=>document.addEventListener(evt,resetTimer));
resetTimer();






//handle logout function clearing all the localStorage and session Strorages 
function handleLogout() {
  // 1. Clear client-side data
  localStorage.clear(); // Clear all local storage data
  sessionStorage.clear(); // Clear all session storage data
  // You might also need to clear specific cookies if used for authentication
  // document.cookie = "cookieName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // 2. (Optional) Send a request to the server for server-side session invalidation
  fetch("/api/logout", {
    method: "POST", // Or GET, depending on your API design
    headers: {
      "Content-Type": "application/json",
      // Include any necessary authentication headers if required for logout API
    },
  })
    .then((response) => {
      if (response.ok) {
        console.log("Server-side logout successful.");
      } else {
        console.error("Server-side logout failed.");
      }
    })
    .catch((error) => {
      console.error("Error during server-side logout:", error);
    });

    window.location.href = "index.html";
  // 3. Redirect the user to a login page or home page
 // window.location.replace("login.html"); // Or '/' for the home page
}

// Attach the logout function to a button click event (example)
document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }
});
