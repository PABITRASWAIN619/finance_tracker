import {
  expensesRef,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "./firebase.js";

import { generateAIResponse } from "./ai.js";

import {
  deleteDoc,
  doc,
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= GLOBALS ================= */

let expenses = [];

let budget = localStorage.getItem("budget") || 0;

let pieInstance = null;
let barInstance = null;

/* ================= THEME ================= */

if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
}

window.toggleTheme = function () {

  document.body.classList.toggle("light");

  let mode =
    document.body.classList.contains("light")
      ? "light"
      : "dark";

  localStorage.setItem("theme", mode);
};

/* ================= BUDGET ================= */

window.setBudget = function () {

  budget = Number(
    document.getElementById("budgetInput").value
  );

  localStorage.setItem("budget", budget);

  updateDashboard();
};

/* ================= FIREBASE REALTIME ================= */

const q = query(expensesRef, orderBy("createdAt", "desc"));

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

  const title = document.getElementById("title").value;

  const amount = Number(
    document.getElementById("amount").value
  );

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

  document.getElementById("title").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("date").value = "";
};

/* ================= DELETE ================= */

window.deleteExpense = async function(id) {

  const db = getFirestore();

  await deleteDoc(doc(db, "expenses", id));
};

/* ================= RENDER ================= */

function render() {

  const list =
    document.getElementById("expenseList");

  list.innerHTML = "";

  expenses.forEach(e => {

    list.innerHTML += `

      <div class="item">

        <span>
          ${e.title}
          - ₹${e.amount}
          (${e.category})
        </span>

        <button onclick="deleteExpense('${e.id}')">
          Delete
        </button>

      </div>
    `;
  });

  drawCharts();
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

function drawCharts() {

  let cat = {};
  let month = {};

  expenses.forEach(e => {

    cat[e.category] =
      (cat[e.category] || 0) + e.amount;

    let m = e.date.slice(0, 7);

    month[m] =
      (month[m] || 0) + e.amount;
  });

  /* DESTROY OLD */

  if (pieInstance) pieInstance.destroy();
  if (barInstance) barInstance.destroy();

  /* PIE */

  pieInstance = new Chart(
    document.getElementById("pieChart"),
    {
      type: "pie",

      data: {
        labels: Object.keys(cat),

        datasets: [{
          data: Object.values(cat)
        }]
      }
    }
  );

  /* BAR */

  barInstance = new Chart(
    document.getElementById("barChart"),
    {
      type: "bar",

      data: {
        labels: Object.keys(month),

        datasets: [{
          data: Object.values(month)
        }]
      }
    }
  );
}
window.setBudget = function () {

  let value =
    document.getElementById("budgetInput").value;

  budget = Number(value);

  localStorage.setItem("budget", budget);

  updateDashboard();
};