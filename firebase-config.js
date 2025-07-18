// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyADcfDWnGussNJwGnjL93PY1axykFFp8v0",
  authDomain: "melvisharamjrleague-e1308.firebaseapp.com",
  projectId: "melvisharamjrleague-e1308",
  storageBucket: "melvisharamjrleague-e1308.appspot.com",
  messagingSenderId: "652800747957",
  appId: "1:652800747957:web:0de91d67b8d1142d7911fc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export so we can use it in script.js
export { auth, db };
