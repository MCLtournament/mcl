import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, getDocs, setDoc, doc, deleteDoc, getDoc, addDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {
  const loading = document.getElementById('loading-overlay');
  const showLoading = on => loading.style.display = on ? 'flex' : 'none';

  const loginPage = document.getElementById('login-page');
  const signupPage = document.getElementById('signup-page');
  const adminDashboard = document.getElementById('admin-dashboard');
  const captainDashboard = document.getElementById('captain-dashboard');
  const captainsTable = document.querySelector('#registered-captains-table tbody');
  const noCaptainsMsg = document.getElementById('no-captains-msg');
  const playerInputsContainer = document.getElementById('player-inputs');

  const adminLoginForm = document.getElementById('admin-login-form');
  const captainLoginForm = document.getElementById('captain-login-form');
  const signupForm = document.getElementById('signup-form');
  const showSignupBtn = document.getElementById('show-signup-btn');
  const backToLoginBtn = document.getElementById('back-to-login-btn');
  const adminLogoutBtn = document.getElementById('admin-logout-btn');
  const captainLogoutBtn = document.getElementById('captain-logout-btn');
  const captainDetailsForm = document.getElementById('captain-details-form');
  const scheduleMatchForm = document.getElementById('schedule-match-form');

  const matchDate = document.getElementById('match-date');
  flatpickr(matchDate, { dateFormat: "Y-m-d", minDate: "today" });

  function showSection(sec) {
    [loginPage, signupPage, adminDashboard, captainDashboard].forEach(s => s.style.display = 'none');
    sec.style.display = 'block';
  }
  showSection(loginPage);

  window.togglePasswordVisibility = id => {
    const inp = document.getElementById(id);
    inp.type = inp.type === 'password' ? 'text' : 'password';
  };

  function renderPlayerInputs(arr = []) {
    playerInputsContainer.innerHTML = '';
    for (let i = 0; i < 11; i++) {
      const input = document.createElement('input');
      input.placeholder = `Player ${i+1}`;
      input.value = arr[i] || '';
      input.required = true;
      input.classList.add('player-input');
      playerInputsContainer.appendChild(input);
    }
  }

  async function loadCaptains() {
    captainsTable.innerHTML = '';
    const snap = await getDocs(collection(db, 'captains'));
    if (snap.empty) {
      noCaptainsMsg.style.display = 'block';
    } else {
      noCaptainsMsg.style.display = 'none';
      snap.forEach(docSnap => {
        const c = docSnap.data();
        const row = captainsTable.insertRow();
        row.insertCell().textContent = c.name;
        row.insertCell().textContent = c.phone;
        row.insertCell().textContent = c.email;
        row.insertCell().textContent = c.schoolGrade;
        row.insertCell().textContent = c.generalGrade || '';
        row.insertCell().textContent = (c.players || []).join(', ');
        const delCell = row.insertCell();
        const btn = document.createElement('button');
        btn.textContent = 'Delete';
        btn.classList.add('logout-button');
        btn.style.background = 'red';
        btn.onclick = async () => {
          const res = await Swal.fire({
            title: `Delete "${c.name}"?`,
            text: "This cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete!'
          });
          if (res.isConfirmed) {
            await deleteDoc(doc(db, 'captains', docSnap.id));
            Swal.fire('Deleted!', `"${c.name}" was removed.`, 'success');
            loadCaptains();
          }
        };
        delCell.appendChild(btn);
      });
    }
  }

  async function loadMatches() {
    const adminMatchList = document.getElementById('upcoming-matches-admin');
    const captainMatchList = document.getElementById('captain-upcoming-matches');

    adminMatchList.innerHTML = '';
    captainMatchList.innerHTML = '';

    const snap = await getDocs(collection(db, 'matches'));
    if (snap.empty) {
      adminMatchList.innerHTML = `<p class="info-message">No matches scheduled yet.</p>`;
      captainMatchList.innerHTML = `<p class="info-message">No upcoming matches yet.</p>`;
    } else {
      const ulAdmin = document.createElement('ul');
      const ulCaptain = document.createElement('ul');

      snap.forEach(docSnap => {
        const match = docSnap.data();
        const liAdmin = document.createElement('li');
        const liCaptain = document.createElement('li');

        const matchText = `${match.team1} vs ${match.team2} — ${match.date} @ ${match.time}`;
        liAdmin.textContent = matchText;
        liCaptain.textContent = matchText;

        // Add Update & Delete buttons in Admin only
        const updateBtn = document.createElement('button');
        updateBtn.textContent = 'Update';
        updateBtn.style.marginLeft = '10px';
        updateBtn.onclick = async () => {
          const { value: formValues } = await Swal.fire({
            title: 'Update Match',
            html:
              `<input id="swal-team1" class="swal2-input" value="${match.team1}" placeholder="Team 1">` +
              `<input id="swal-team2" class="swal2-input" value="${match.team2}" placeholder="Team 2">` +
              `<input id="swal-date" class="swal2-input" value="${match.date}" placeholder="YYYY-MM-DD">` +
              `<input id="swal-time" class="swal2-input" value="${match.time}" placeholder="HH:MM">`,
            focusConfirm: false,
            preConfirm: () => {
              return {
                team1: document.getElementById('swal-team1').value,
                team2: document.getElementById('swal-team2').value,
                date: document.getElementById('swal-date').value,
                time: document.getElementById('swal-time').value
              }
            }
          });

          if (formValues) {
            await updateDoc(doc(db, 'matches', docSnap.id), formValues);
            Swal.fire('Updated!', 'Match details updated.', 'success');
            loadMatches();
          }
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.style.backgroundColor = 'red';
        deleteBtn.onclick = async () => {
          await deleteDoc(doc(db, 'matches', docSnap.id));
          Swal.fire('Deleted!', 'Match removed.', 'success');
          loadMatches();
        };

        liAdmin.appendChild(updateBtn);
        liAdmin.appendChild(deleteBtn);

        ulAdmin.appendChild(liAdmin);
        ulCaptain.appendChild(liCaptain);
      });

      adminMatchList.appendChild(ulAdmin);
      captainMatchList.appendChild(ulCaptain);
    }
  }

  adminLoginForm.addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('admin-username').value.trim();
    const p = document.getElementById('admin-password').value.trim();
    if (u === 'SHAFEE' && p === 'adminpass') {
      Swal.fire('Success', 'Admin login successful', 'success');
      showSection(adminDashboard);
      loadCaptains();
      loadMatches();
    } else {
      Swal.fire('Error', 'Invalid Admin Credentials', 'error');
    }
  });

  showSignupBtn.addEventListener('click', () => {
    signupForm.reset();
    showSection(signupPage);
  });
  backToLoginBtn.addEventListener('click', () => showSection(loginPage));

  signupForm.addEventListener('submit', async e => {
    e.preventDefault(); showLoading(true);
    const name = document.getElementById('signup-name').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const schoolGrade = document.getElementById('signup-school-grade').value;
    const password = document.getElementById('signup-password').value;

    try {
      const uc = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'captains', uc.user.uid), {
        uid: uc.user.uid, name, phone, email,
        schoolGrade, generalGrade: '', players: Array(11).fill('')
      });
      Swal.fire('Success','Sign‑up successful! Please log in.','success');
      signupForm.reset(); showSection(loginPage);
    } catch(err) {
      Swal.fire('Error','Signup failed: '+err.message,'error');
    } finally { showLoading(false); }
  });

  captainLoginForm.addEventListener('submit', async e => {
    e.preventDefault(); showLoading(true);
    const email = document.getElementById('captain-email').value.trim();
    const password = document.getElementById('captain-password').value;

    try {
      const uc = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, 'captains', uc.user.uid));
      if (!snap.exists()) {
        Swal.fire('Error','No data found—please sign up first.','error');
        showSection(loginPage);
      } else {
        const data = snap.data();
        document.getElementById('captain-dashboard-name').value = data.name;
        document.getElementById('captain-general-grade').value = data.generalGrade || '';
        renderPlayerInputs(data.players||[]);
        Swal.fire('Success','Logged in successfully','success');
        showSection(captainDashboard);
        loadMatches();
      }
    } catch(err) {
      Swal.fire('Error','Login failed: '+err.message,'error');
    } finally { showLoading(false); }
  });

  captainDetailsForm.addEventListener('submit', async e => {
    e.preventDefault(); showLoading(true);
    const user = auth.currentUser;
    const teamName = document.getElementById('captain-dashboard-name').value.trim();
    const generalGrade = document.getElementById('captain-general-grade').value;
    const players = Array.from(playerInputsContainer.querySelectorAll('input')).map(i=>i.value.trim());

    try {
      await setDoc(doc(db, 'captains', user.uid), {
        uid: user.uid,
        name: teamName,
        email: user.email,
        generalGrade,
        players
      }, { merge: true });
      Swal.fire('Success','Team updated!','success');
    } catch(err) {
      Swal.fire('Error','Update failed: '+err.message,'error');
    } finally { showLoading(false); }
  });

  // ✅ Schedule Match + Save to Firestore
  scheduleMatchForm.addEventListener('submit', async e => {
    e.preventDefault();
    const t1 = document.getElementById('team1').value.trim();
    const t2 = document.getElementById('team2').value.trim();
    const d = document.getElementById('match-date').value;
    const ti = document.getElementById('match-time').value;

    if (t1 && t2 && d && ti && t1 !== t2) {
      try {
        await addDoc(collection(db, 'matches'), { team1: t1, team2: t2, date: d, time: ti });
        Swal.fire('Success','Match Scheduled!','success');
        scheduleMatchForm.reset();
        loadMatches();
      } catch(err) {
        Swal.fire('Error','Failed to save match.','error');
      }
    } else {
      Swal.fire('Error','Fill all fields correctly, and ensure teams differ.','error');
    }
  });

  adminLogoutBtn.addEventListener('click', () => showSection(loginPage));
  captainLogoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    showSection(loginPage);
  });
});
