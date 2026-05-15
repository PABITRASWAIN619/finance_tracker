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

/* ================= PAGE LOAD ================= */

window.onload = function () {

  checkLogin();

  render();

  updateDashboard();

  setupTheme();

  setupDateValidation();
};

/* ================= LOGIN SYSTEM ================= */

/*
IMPORTANT FIX:

1. First time user:
   -> Show welcome screen

2. After login:
   -> Stay in dashboard

3. If user changes tab/minimize:
   -> Dashboard should NOT reset

4. Only show welcome screen again
   if browser fully closed and reopened
*/

/* SESSION CHECK */

function checkLogin() {

  const username =
    localStorage.getItem(
      "username"
    );

  const activeSession =
    sessionStorage.getItem(
      "activeSession"
    );

  /* FIRST TIME OPEN */

  if (
    !username ||
    !activeSession
  ) {

    showWelcomeScreen();

    return;
  }

  /* USER ALREADY LOGGED */

  showDashboard(username);
}

/* SHOW WELCOME */

function showWelcomeScreen() {

  document.getElementById(
    "welcomeScreen"
  ).style.display = "flex";

  document.getElementById(
    "mainApp"
  ).style.display = "none";

  const oldUser =
    localStorage.getItem(
      "username"
    );

  if (oldUser) {

    document.getElementById(
      "usernameInput"
    ).value = oldUser;
  }
}

/* SHOW DASHBOARD */

function showDashboard(username) {

  document.getElementById(
    "welcomeScreen"
  ).style.display = "none";

  document.getElementById(
    "mainApp"
  ).style.display = "block";

  document.getElementById(
    "displayUsername"
  ).innerText = username;
}

/* ================= SAVE USER ================= */

window.saveUsername = function () {

  const username =
    document.getElementById(
      "usernameInput"
    ).value.trim();

  if (!username) {

    alert(
      "Please enter your name"
    );

    return;
  }

  /* SAVE USER */

  localStorage.setItem(
    "username",
    username
  );

  /* SESSION LOGIN */

  sessionStorage.setItem(
    "activeSession",
    "true"
  );

  /* SHOW DASHBOARD */

  showDashboard(username);

  /* MOBILE FIX */

  setTimeout(() => {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }, 100);
};

/* ================= ENTER KEY ================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const input =
      document.getElementById(
        "usernameInput"
      );

    if (input) {

      input.addEventListener(
        "keypress",
        function (e) {

          if (e.key === "Enter") {

            saveUsername();
          }
        }
      );
    }
  }
);

/* ================= THEME ================= */

function setupTheme() {

  const savedTheme =
    localStorage.getItem("theme");

  if (savedTheme === "light") {

    document.body.classList.add(
      "light"
    );

    document.getElementById(
      "themeBtn"
    ).innerHTML = "☀";
  }
}

window.toggleTheme = function () {

  document.body.classList.toggle(
    "light"
  );

  const isLight =
    document.body.classList.contains(
      "light"
    );

  localStorage.setItem(
    "theme",
    isLight
      ? "light"
      : "dark"
  );

  document.getElementById(
    "themeBtn"
  ).innerHTML =
    isLight
      ? "☀"
      : "🌙";

  render();
};

/* ================= DATE VALIDATION ================= */

function setupDateValidation() {

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
}

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

    alert(
      "Please enter budget"
    );

    return;
  }

  budget = Number(value);

  localStorage.setItem(
    "budget",
    budget
  );

  updateDashboard();

  alert(
    "Budget Saved Successfully ✅"
  );
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

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

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

  const confirmDelete =
    confirm(
      "Delete this expense?"
    );

  if (!confirmDelete) return;

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

  if (!filtered.length) {

    list.innerHTML = `

      <div class="card empty-card">

        <h3>
          No expenses found 😔
        </h3>

      </div>
    `;

    drawChart();

    return;
  }

  filtered.reverse().forEach(e => {

    list.innerHTML += `

      <div class="item">

        <div class="item-left">

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
            class="edit-btn"
            onclick="editExpense(${e.id})"
          >
            ✏ Edit
          </button>

          <button
            class="delete-btn"
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
      "⚠ Overspending detected!";
  }

  else if (
    total > budget * 0.7
  ) {

    msg =
      "📊 You are close to budget limit.";
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

  if (pieChart) {

    pieChart.destroy();
  }

  const textColor =
    document.body.classList.contains(
      "light"
    )
      ? "#0f172a"
      : "#ffffff";

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
        ]
      }]
    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      plugins: {

        legend: {

          labels: {

            color: textColor
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