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

// Dummy data to display in the cards
const data = {
  totalSales: '₹4,316.11',
  todaysSales: '₹0',
  activeVendors: 7,
  avgTransaction: '₹415',
  totalProducts: 38,
  stockAlerts: 17
};

// Update the card data with actual values
document.getElementById('total-sales').textContent = data.totalSales;
document.getElementById('todays-sales').textContent = data.todaysSales;
document.getElementById('active-vendors').textContent = data.activeVendors;
document.getElementById('avg-transaction').textContent = data.avgTransaction;
document.getElementById('total-products').textContent = data.totalProducts;
document.getElementById('stock-alerts').textContent = data.stockAlerts;

// Update the date and time every second
setInterval(updateDateTime, 1000);
updateDateTime(); // Initial call to set the date and time
