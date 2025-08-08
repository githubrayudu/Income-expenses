
// Fetch total income or expenses
async function fetchTotal(endpoint) {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Failed to fetch from ${endpoint}`);
    const data = await res.json();
    if (!Array.isArray(data)) return 0;
    return data.reduce((sum, tx) => sum + parseFloat(tx.totalAmountOfProduct || 0), 0);
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
