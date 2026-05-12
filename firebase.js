import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain: "YOUR_DOMAIN",

  projectId: "YOUR_PROJECT_ID",

  storageBucket: "YOUR_BUCKET",

  messagingSenderId: "YOUR_ID",

  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const expensesRef =
  collection(db, "expenses");

export {
  addDoc,
  onSnapshot,
  query,
  orderBy
};