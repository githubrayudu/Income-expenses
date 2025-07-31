document.addEventListener("DOMContentLoaded", () => {
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



  // Other functions in your code (such as the Auth and Profit/Loss calculation)
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



  const form = document.getElementById("transactionForm");
const type = document.getElementById("type").value;
  const endpoint = `http://localhost/Ei_backend/api/${type}.php`;

  const inputs = {
    dateInput: document.getElementById("dateOfTransaction"),
    reviewerInput: document.getElementById("reviewer"),
    categoryInput: document.getElementById("category"),
    descriptionInput: document.getElementById("description"),
    invoiceNoInput: document.getElementById("invoiceNo"),
    productNameInput: document.getElementById("productName"),
    quantityInput: document.getElementById("quantity"),
    amountInput: document.getElementById("amount"),
  };

  const transactionList = document.getElementById("transactionList");
  const balanceAmountSpan =
    document.getElementById("balanceAmount") ||
    document.getElementById("totalExpenses");
  const searchBox = document.getElementById("searchBox");

  let allTransactions = [];
  let editingTransactionId = null; // Track edit mode






  // Fetch all transactions from backend
  async function fetchTransactions() {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Failed to fetch ${type} transactions`);
      const data = await res.json();
      allTransactions = data;
      renderTable(allTransactions);
    } catch (err) {
      console.error(`Error fetching ${type} transactions:`, err);
      alert(`Error loading ${type}: ` + err.message);
    }
  }

  // Render table rows
  function renderTable(data) {
    transactionList.innerHTML = "";
    let total = 0;

    if (Array.isArray(data) && data.length > 0) {
      data.forEach((tx) => {
        const totalAmount = parseFloat(tx.quantity) * parseFloat(tx.amount);
        total += totalAmount;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(tx.dateInsertedIntoDataBase).toLocaleDateString()}</td>
          <td>${type}</td>
          <td>${tx.reviewer}</td>
          <td>${tx.category}</td>
          <td>${tx.description}</td>
          <td>${tx.invoiceNo}</td>
          <td>${tx.productName}</td>
          <td>${tx.quantity}</td>
          <td>${parseFloat(tx.amount)}</td>
          <td>${totalAmount.toFixed(2)}</td>
          <td>
       
            <button class="delete-btn" data-id="${tx.id}">Delete</button>
          </td>
        `;
        transactionList.appendChild(row);
      });

      // Attach delete handlers
      transactionList.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async () => {
          const id = button.getAttribute("data-id");
          if (!confirm("Are you sure you want to delete this transaction?"))
            return;

          try {
            const res = await fetch(`${endpoint}?id=${id}`, {
              method: "DELETE",
            });
            if (!res.ok) {
              let errMsg = "Delete failed";
              try {
                const err = await res.json();
                errMsg = err.error || errMsg;
              } catch (_) {}
              throw new Error(errMsg);
            }
            await fetchTransactions(); // Refresh
          } catch (err) {
            console.error("Delete failed:", err);
            alert("Could not delete transaction: " + err.message);
          }
        });
      });
    } else {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
cell.colSpan = 11;
cell.textContent = `No ${type} transactions found.`;
row.appendChild(cell);

      transactionList.appendChild(row);
    }

    balanceAmountSpan.textContent = total.toFixed(2);
  }

  // Handle form submit
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const type = document.getElementById("type").value;
      const endpoint = `http://localhost/Ei_backend/api/${type}.php`;

      const transaction = {
        dateInsertedIntoDataBase: inputs.dateInput.value,
        reviewer: inputs.reviewerInput.value,
        category: inputs.categoryInput.value,
        description: inputs.descriptionInput.value,
        invoiceNo: inputs.invoiceNoInput.value,
        productName: inputs.productNameInput.value,
        quantity: parseInt(inputs.quantityInput.value),
        amount: parseFloat(inputs.amountInput.value),
        totalAmountOfProduct:
          parseInt(inputs.quantityInput.value) *
          parseFloat(inputs.amountInput.value),
      };

      // Add ID for PUT request
      if (editingTransactionId) {
        transaction.id = parseInt(editingTransactionId);
      }

      // Basic validation
      if (
        !transaction.dateInsertedIntoDataBase ||
        !transaction.reviewer ||
        !transaction.category ||
        !transaction.description ||
        !transaction.invoiceNo ||
        !transaction.productName ||
        isNaN(transaction.quantity) ||
        isNaN(transaction.amount) ||
        transaction.quantity <= 0 ||
        transaction.amount <= 0
      ) {
        alert("Please fill in all required fields correctly.");
        return;
      }

      try {
        const res = await fetch(endpoint, {
          method: editingTransactionId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transaction),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to save transaction");
        }

        form.reset();
        editingTransactionId = null;
        await fetchTransactions();
      } catch (err) {
        console.error(`Error saving ${type} transaction:`, err);
        alert(`Failed to save ${type} transaction: ` + err.message);
      }
    });
  }

  // Search box filter
  searchBox.addEventListener("input", () => {
    const term = searchBox.value.toLowerCase();
    const filtered = allTransactions.filter((tx) =>
      tx.invoiceNo.toLowerCase().includes(term)
    );
    renderTable(filtered);
  });

  // Initial fetch
  fetchTransactions();
    setInterval(updateClock, 1000);
    updateClock();  // Initial call to set the time immediately
});











    
// document.addEventListener("DOMContentLoaded", () => {
//   // Clock update function
//   function updateClock() {
//     const now = new Date();

//     const day = now.getDate().toString().padStart(2, "0");
//     const monthNames = [
//       "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
//     ];
//     const month = monthNames[now.getMonth()];
//     const year = now.getFullYear();

//     let hours = now.getHours();
//     const minutes = now.getMinutes().toString().padStart(2, "0");
//     const ampm = hours >= 12 ? "PM" : "AM";
//     hours = hours % 12;
//     hours = hours ? hours : 12; // Fix hour '0' to 12

//     const time = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
//     const formatted = `${day} ${month} ${year} ${time}`;

//     // Update clock element
//     const clockElement = document.getElementById("clock");
//     if (clockElement) {
//       clockElement.textContent = formatted;
//     }
//   }

//   // Call updateClock immediately and set interval to update every second
//   setInterval(updateClock, 1000);  // Update every second
//   updateClock();  // Initialize clock immediately

//   // Other functions in your code (such as the Auth and Profit/Loss calculation)
//   const checkAuth = () => {
//     const loggedIn = localStorage.getItem("loggedin");
//     if (loggedIn) {
//       const username = localStorage.getItem("username");
//       document.getElementById("profileName").style.display = "block";
//       document.getElementById("userNameDisplay").textContent = username;
//     } else {
//       window.location.href = "index.html";
//     }
//   };

//   // Authentication check
//   document.addEventListener("DOMContentLoaded", checkAuth);

//   // Calculate Profit or Loss (other existing code remains unchanged)
//   async function calculateProfitOrLoss() {
//     const incomeEndpoint = "http://localhost/Ei_backend/api/income.php";
//     const expensesEndpoint = "http://localhost/Ei_backend/api/expenses.php";

//     const [income, expenses] = await Promise.all([
//       fetchTotal(incomeEndpoint),
//       fetchTotal(expensesEndpoint),
//     ]);
//     console.log(income);
//     console.log(expenses);
//     document.getElementById("total-income").textContent = `₹${income.toFixed(2)}`;
//     document.getElementById("total-expenses").textContent = `₹${expenses.toFixed(2)}`;

//     const resultEl = document.getElementById("profitOrLoss");
//     if (income > expenses) {
//       resultEl.textContent = `Profit: ₹${(income - expenses).toFixed(2)}`;
//       resultEl.style.color = "green";
//     } else if (expenses > income) {
//       resultEl.textContent = `Loss: ₹${(expenses - income).toFixed(2)}`;
//       resultEl.style.color = "red";
//     } else {
//       resultEl.textContent = "Break-even";
//       resultEl.style.color = "gray";
//     }
//   }

//   // Logout function (your existing code)
//   const logout = () => {
//     localStorage.removeItem("loggedin");
//     window.location.href = "index.html";
//   };

//   // Hamburger and submenu toggle (for mobile)
//   const hamburger = document.getElementById("hamburger");
//   const navMenu = document.getElementById("navMenu");

//   hamburger.addEventListener("click", () => {
//     navMenu.classList.toggle("open");
//     hamburger.classList.toggle("clicked");
//   });

//   document.querySelectorAll(".has-submenu > a").forEach((link) => {
//     link.addEventListener("click", function (e) {
//       e.preventDefault();
//       const submenu = this.nextElementSibling;
//       submenu.classList.toggle("open");

//       const arrow = this.querySelector(".arrow");
//       if (arrow) arrow.classList.toggle("rotate");
//     });
//   });

//   document.querySelectorAll(".nav-menu .submenu a").forEach((link) => {
//     link.addEventListener("click", () => {
//       navMenu.classList.remove("open");
//       hamburger.classList.remove("clicked");
//     });
//   });

// });
