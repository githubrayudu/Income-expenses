// function checkAuth(){
//   if (localStorage.getItem('loggedin')!=='true') {
//     window.location.href = 'login.html';
//   }
// }


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