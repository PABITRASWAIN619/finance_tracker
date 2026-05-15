/* ================= GLOBALS ================= */

let expenses =
  JSON.parse(
    localStorage.getItem("expenses")
  ) || [];

let budget =
  Number(
    localStorage.getItem("budget")
  ) || 0;

let pieChart;

/* ================= USER SYSTEM ================= */

function initializeUser() {

  const savedUser =
    localStorage.getItem("username");

  if (savedUser) {

    document.getElementById(
      "welcomeScreen"
    ).style.display = "none";

    document.getElementById(
      "mainApp"
    ).style.display = "block";

    document.getElementById(
      "displayUsername"
    ).innerText = savedUser;
  }
}

window.saveUsername = function () {

  const username =
    document.getElementById(
      "usernameInput"
    ).value.trim();

  if (!username) {

    alert("Please enter your name");

    return;
  }

  localStorage.setItem(
    "username",
    username
  );

  initializeUser();
};

initializeUser();

/* ================= THEME ================= */

if (
  localStorage.getItem("theme")
  === "light"
) {

  document.body.classList.add(
    "light"
  );
}

window.toggleTheme = function () {

  document.body.classList.toggle(
    "light"
  );

  const mode =
    document.body.classList.contains(
      "light"
    )
      ? "light"
      : "dark";

  localStorage.setItem(
    "theme",
    mode
  );
};

/* ================= DATE VALIDATION ================= */

const today =
  new Date()
    .toISOString()
    .split("T")[0];

document.getElementById(
  "date"
).setAttribute(
  "max",
  today
);

/* ================= BUDGET ================= */

document.getElementById(
  "budgetInput"
).value = budget;

window.setBudget = function () {

  const value =
    document.getElementById(
      "budgetInput"
    ).value;

  if (!value) {

    alert("Enter budget");

    return;
  }

  budget = Number(value);

  localStorage.setItem(
    "budget",
    budget
  );

  updateDashboard();

  alert("Budget Saved Successfully ✅");
};

/* ================= ADD EXPENSE ================= */

window.addExpense = function () {

  const title =
    document.getElementById(
      "title"
    ).value.trim();

  const amount =
    Number(
      document.getElementById(
        "amount"
      ).value
    );

  const category =
    document.getElementById(
      "category"
    ).value;

  const date =
    document.getElementById(
      "date"
    ).value;

  /* VALIDATION */

  if (
    !title ||
    !amount ||
    !date
  ) {

    alert(
      "Please fill all fields"
    );

    return;
  }

  if (date > today) {

    alert(
      "Future dates are not allowed"
    );

    return;
  }

  expenses.push({

    id: Date.now(),

    title,

    amount,

    category,

    date
  });

  localStorage.setItem(

    "expenses",

    JSON.stringify(expenses)
  );

  render();

  updateDashboard();

  /* CLEAR INPUTS */

  document.getElementById(
    "title"
  ).value = "";

  document.getElementById(
    "amount"
  ).value = "";

  document.getElementById(
    "date"
  ).value = "";
};

/* ================= DELETE ================= */

window.deleteExpense = function (id) {

  expenses =
    expenses.filter(
      e => e.id !== id
    );

  localStorage.setItem(
    "expenses",
    JSON.stringify(expenses)
  );

  render();

  updateDashboard();
};

/* ================= EDIT ================= */

window.editExpense = function (id) {

  const expense =
    expenses.find(
      e => e.id === id
    );

  if (!expense) return;

  document.getElementById(
    "title"
  ).value = expense.title;

  document.getElementById(
    "amount"
  ).value = expense.amount;

  document.getElementById(
    "category"
  ).value = expense.category;

  document.getElementById(
    "date"
  ).value = expense.date;

  /* REMOVE OLD */

  expenses =
    expenses.filter(
      e => e.id !== id
    );

  localStorage.setItem(
    "expenses",
    JSON.stringify(expenses)
  );

  render();

  updateDashboard();

  window.scrollTo({

    top: 0,

    behavior: "smooth"
  });
};

/* ================= RENDER ================= */

function render() {

  const list =
    document.getElementById(
      "expenseList"
    );

  const search =
    document.getElementById(
      "searchInput"
    ).value.toLowerCase();

  const filter =
    document.getElementById(
      "filterCategory"
    ).value;

  /* FILTER */

  let filtered =
    expenses.filter(e => {

      const matchesSearch =
        e.title
          .toLowerCase()
          .includes(search);

      const matchesFilter =
        filter === "All"
        ||
        e.category === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  list.innerHTML = "";

  /* EMPTY */

  if (!filtered.length) {

    list.innerHTML = `

      <div class="card">

        <h3>
          No expenses found 😔
        </h3>

      </div>
    `;

    drawChart();

    return;
  }

  /* SHOW LIST */

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

        <div class="item-buttons">

          <button
            onclick="editExpense(${e.id})"
          >
            ✏ Edit
          </button>

          <button
            onclick="deleteExpense(${e.id})"
          >
            🗑 Delete
          </button>

        </div>

      </div>
    `;
  });

  drawChart();
}

/* ================= DASHBOARD ================= */

function updateDashboard() {

  let total =
    expenses.reduce(
      (a, b) => a + b.amount,
      0
    );

  document.getElementById(
    "budgetVal"
  ).innerText =
    `₹${budget}`;

  document.getElementById(
    "expenseVal"
  ).innerText =
    `₹${total}`;

  document.getElementById(
    "remainVal"
  ).innerText =
    `₹${budget - total}`;

  generateAI(total);
}

/* ================= AI ================= */

function generateAI(total) {

  let msg = "";

  if (
    budget > 0 &&
    total > budget
  ) {

    msg =
      "⚠ Overspending detected! Reduce unnecessary expenses.";
  }

  else if (
    total > budget * 0.7
  ) {

    msg =
      "📊 You are close to your budget limit.";
  }

  else {

    msg =
      "✅ Your spending looks healthy.";
  }

  document.getElementById(
    "aiInsight"
  ).innerText = msg;
}

/* ================= CHART ================= */

function drawChart() {

  const ctx =
    document.getElementById(
      "pieChart"
    );

  let categories = {};

  expenses.forEach(e => {

    categories[e.category] =
      (categories[e.category] || 0)
      + e.amount;
  });

  /* DESTROY OLD */

  if (pieChart) {

    pieChart.destroy();
  }

  pieChart = new Chart(ctx, {

    type: "doughnut",

    data: {

      labels:
        Object.keys(categories),

      datasets: [{

        data:
          Object.values(categories),

        backgroundColor: [

          "#3b82f6",
          "#8b5cf6",
          "#06b6d4",
          "#10b981",
          "#f59e0b",
          "#ef4444"
        ],

        hoverOffset: 15,

        borderRadius: 10,

        borderWidth: 3,

        borderColor: "#0f172a"
      }]
    },

    options: {

      responsive: true,

      cutout: "65%",

      plugins: {

        legend: {

          position: "bottom",

          labels: {

            color: "white",

            padding: 20,

            font: {

              size: 14
            }
          }
        }
      }
    }
  });
}

/* ================= SEARCH ================= */

document.getElementById(
  "searchInput"
).addEventListener(
  "input",
  render
);

document.getElementById(
  "filterCategory"
).addEventListener(
  "change",
  render
);

/* ================= INIT ================= */

render();

updateDashboard();