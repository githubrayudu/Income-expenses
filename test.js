// Update current date and time every second
function updateDateTime() {
  const date = new Date();

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("date").textContent = date.toLocaleDateString(undefined, options);

  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  const timeStr = `${hours}:${minutes} ${ampm}`;
  document.getElementById("time").textContent = timeStr;
}

// Fetch total income or expenses
async function fetchTotal(endpoint) {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Failed to fetch from ${endpoint}`);
    const data = await res.json();
    if (!Array.isArray(data)) return 0;
    return data.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
  } catch (err) {
    console.error(err);
    return 0;
  }
}

// Dummy dashboard data
const dummyData = {
  avgTransaction: "₹415",
  totalProducts: 38,
  stockAlerts: 17,
};

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  calculateProfitOrLoss();
  updateDateTime();
  setInterval(updateDateTime, 1000);

  document.getElementById("avg-transaction").textContent = dummyData.avgTransaction;
  document.getElementById("total-products").textContent = dummyData.totalProducts;
  document.getElementById("stock-alerts").textContent = dummyData.stockAlerts;
});
