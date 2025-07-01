// firebase-config.js

// Load the Firebase SDK (make sure these <script> tags are in your HTML before this file):
// <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlboKcxcOZmqWLlt79VEovpWOFSKHgBbI",
  authDomain: "badwolfcalisthenics-77163.firebaseapp.com",
  projectId: "badwolfcalisthenics-77163",
  storageBucket: "badwolfcalisthenics-77163",
  messagingSenderId: "96009387710",
  appId: "1:96009387710:web:26f882be84a823ecf228ef",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

window.addEventListener("DOMContentLoaded", () => {
  const userNameElem = document.getElementById("user-name");
  const logoutBtn = document.getElementById("logout-btn");
  const signInBtn = document.getElementById("sign-in-btn");
  const signUpBtn = document.getElementById("sign-up-btn");

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User logged in: show logout, hide sign-in and sign-up
      if (userNameElem) {
        userNameElem.textContent = `Welcome, ${user.displayName || user.email}`;
      }
      if (logoutBtn) logoutBtn.style.display = "inline-block";
      if (signInBtn) signInBtn.style.display = "none";
      if (signUpBtn) signUpBtn.style.display = "none";
    } else {
      // No user logged in: show sign-in and sign-up, hide logout
      if (userNameElem) {
        userNameElem.textContent = "";
      }
      if (logoutBtn) logoutBtn.style.display = "none";
      if (signInBtn) signInBtn.style.display = "inline-block";
      if (signUpBtn) signUpBtn.style.display = "inline-block";
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          window.location.href = "/";
        });
    });
  }
});

// Pseudocode example for Firebase auth state
firebase.auth().onAuthStateChanged((user) => {
  // First make all auth buttons visible
  document.querySelectorAll(".nav-auth a").forEach((btn) => {
    btn.style.visibility = "visible";
  });

  if (user) {
    // User is signed in, show logout only
    document.getElementById("logout-btn").style.display = "inline-block";
    document.getElementById("sign-in-btn").style.display = "none";
    document.getElementById("sign-up-btn").style.display = "none";
  } else {
    // User signed out, show login and sign-up only
    document.getElementById("logout-btn").style.display = "none";
    document.getElementById("sign-in-btn").style.display = "inline-block";
    document.getElementById("sign-up-btn").style.display = "inline-block";
  }
});
