import {
  expensesRef,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "./firebase.js";

import { generateAIResponse }
from "./ai.js";

import {
  deleteDoc,
  doc,
  getFirestore
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= GLOBALS ================= */

let expenses = [];

let budget =
  Number(localStorage.getItem("budget")) || 0;

let pieInstance = null;

let barInstance = null;

/* ================= THEME ================= */

if (localStorage.getItem("theme") === "light") {

  document.body.classList.add("light");

  const btn =
    document.getElementById("themeBtn");

  if (btn) btn.innerText = "☀";
}

window.toggleTheme = function () {

  document.body.classList.toggle("light");

  let mode =
    document.body.classList.contains("light")
      ? "light"
      : "dark";

  localStorage.setItem("theme", mode);

  const btn =
    document.getElementById("themeBtn");

  if (mode === "light") {

    btn.innerText = "☀";

  } else {

    btn.innerText = "🌙";
  }
};

/* ================= BUDGET ================= */

window.setBudget = function () {

  let value =
    document.getElementById("budgetInput").value;

  if (!value) {

    alert("Enter budget amount");

    return;
  }

  budget = Number(value);

  localStorage.setItem("budget", budget);

  updateDashboard();

  document.getElementById("budgetInput").value = "";
};

/* ================= FIREBASE REALTIME ================= */

const q = query(
  expensesRef,
  orderBy("createdAt", "desc")
);

onSnapshot(q, (snapshot) => {

  expenses = snapshot.docs.map(doc => ({

    id: doc.id,

    ...doc.data()
  }));

  render();

  updateDashboard();
});

/* ================= ADD EXPENSE ================= */

window.addExpense = async function () {

  const title =
    document.getElementById("title").value.trim();

  const amount =
    Number(document.getElementById("amount").value);

  const category =
    document.getElementById("category").value;

  const date =
    document.getElementById("date").value;

  if (!title || !amount || !date) {

    alert("Please fill all fields");

    return;
  }

  await addDoc(expensesRef, {

    title,

    amount,

    category,

    date,

    createdAt: Date.now()
  });

  /* CLEAR FORM */

  document.getElementById("title").value = "";

  document.getElementById("amount").value = "";

  document.getElementById("date").value = "";
};

/* ================= DELETE ================= */

window.deleteExpense = async function(id) {

  const db = getFirestore();

  await deleteDoc(
    doc(db, "expenses", id)
  );
};

/* ================= SEARCH + FILTER ================= */

document
  .getElementById("searchInput")
  .addEventListener("input", render);

document
  .getElementById("filterCategory")
  .addEventListener("change", render);

/* ================= RENDER ================= */

function render() {

  const list =
    document.getElementById("expenseList");

  list.innerHTML = "";

  const search =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase();

  const filter =
    document
      .getElementById("filterCategory")
      .value;

  let filtered = expenses.filter(e => {

    const matchSearch =
      e.title.toLowerCase().includes(search);

    const matchFilter =
      filter === "All" ||
      e.category === filter;

    return matchSearch && matchFilter;
  });

  /* EMPTY */

  if (!filtered.length) {

    list.innerHTML = `

      <div class="card">

        <h3>
          No expenses found 😔
        </h3>

      </div>
    `;

    drawCharts([]);

    return;
  }

  /* RENDER ITEMS */

  filtered.forEach(e => {

    list.innerHTML += `

      <div class="item">

        <div>

          <h3>
            ${e.title}
          </h3>

          <p>

            ₹${e.amount}

            • ${e.category}

            • ${e.date}

          </p>

        </div>

        <button
          onclick="deleteExpense('${e.id}')"
        >
          ❌
        </button>

      </div>
    `;
  });

  drawCharts(filtered);
}

/* ================= DASHBOARD ================= */

function updateDashboard() {

  let total = expenses.reduce(

    (a, b) => a + b.amount,

    0
  );

  document.getElementById("budgetVal")
    .innerText = `₹${budget}`;

  document.getElementById("expenseVal")
    .innerText = `₹${total}`;

  document.getElementById("remainVal")
    .innerText = `₹${budget - total}`;

  document.getElementById("aiInsight")
    .innerText =
      generateAIResponse(expenses, budget);
}

/* ================= CHARTS ================= */

function drawCharts(data = expenses) {

  let cat = {};

  let month = {};

  data.forEach(e => {

    cat[e.category] =
      (cat[e.category] || 0) + e.amount;

    let m = e.date.slice(0, 7);

    month[m] =
      (month[m] || 0) + e.amount;
  });

  /* DESTROY OLD */

  if (pieInstance) pieInstance.destroy();

  if (barInstance) barInstance.destroy();

  /* PIE CHART */

  pieInstance = new Chart(

    document.getElementById("pieChart"),

    {
      type: "pie",

      data: {

        labels: Object.keys(cat),

        datasets: [{

          data: Object.values(cat),

          backgroundColor: [

            "#3b82f6",

            "#8b5cf6",

            "#06b6d4",

            "#10b981"
          ],

          borderWidth: 0
        }]
      },

      options: {

        responsive: true,

        plugins: {

          legend: {

            labels: {

              color: "white",

              font: {

                size: 14
              }
            }
          }
        }
      }
    }
  );

  /* BAR CHART */

  barInstance = new Chart(

    document.getElementById("barChart"),

    {
      type: "bar",

      data: {

        labels: Object.keys(month),

        datasets: [{

          label: "Monthly Expenses",

          data: Object.values(month),

          backgroundColor: "#3b82f6",

          borderRadius: 10
        }]
      },

      options: {

        responsive: true,

        scales: {

          y: {

            ticks: {

              color: "white"
            },

            grid: {

              color: "rgba(255,255,255,0.1)"
            }
          },

          x: {

            ticks: {

              color: "white"
            },

            grid: {

              color: "rgba(255,255,255,0.1)"
            }
          }
        },

        plugins: {

          legend: {

            labels: {

              color: "white"
            }
          }
        }
      }
    }
  );
}

/* ================= INITIAL LOAD ================= */

updateDashboard();