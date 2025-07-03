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

// auth-handler.js

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    const idToken = await user.getIdToken();
    document.cookie = `token=${idToken}; path=/; secure; samesite=strict`;
  } else {
    document.cookie = "token=; Max-Age=0; path=/;"; // clear token on logout
  }
});

// Make sure Firebase SDK scripts are loaded BEFORE this script

window.addEventListener("DOMContentLoaded", () => {
  // Get all relevant elements (desktop and mobile)
  const userNameElem = document.getElementById("user-name");

  const logoutBtnDesktop = document.getElementById("logout-btn");
  const signInBtnDesktop = document.getElementById("sign-in-btn");
  const signUpBtnDesktop = document.getElementById("sign-up-btn");

  const logoutBtnMobile = document.getElementById("logout-btn-mobile");
  const signInBtnMobile = document.getElementById("sign-in-btn-mobile");
  const signUpBtnMobile = document.getElementById("sign-up-btn-mobile");

  // Helper function to show/hide auth buttons consistently
  function setAuthButtons(user) {
    if (user) {
      if (userNameElem) {
        userNameElem.textContent = `Welcome, ${user.displayName || user.email}`;
      }
      if (logoutBtnDesktop) logoutBtnDesktop.style.display = "inline-block";
      if (signInBtnDesktop) signInBtnDesktop.style.display = "none";
      if (signUpBtnDesktop) signUpBtnDesktop.style.display = "none";

      if (logoutBtnMobile) logoutBtnMobile.style.display = "inline-block";
      if (signInBtnMobile) signInBtnMobile.style.display = "none";
      if (signUpBtnMobile) signUpBtnMobile.style.display = "none";
    } else {
      if (userNameElem) userNameElem.textContent = "";

      if (logoutBtnDesktop) logoutBtnDesktop.style.display = "none";
      if (signInBtnDesktop) signInBtnDesktop.style.display = "inline-block";
      if (signUpBtnDesktop) signUpBtnDesktop.style.display = "inline-block";

      if (logoutBtnMobile) logoutBtnMobile.style.display = "none";
      if (signInBtnMobile) signInBtnMobile.style.display = "inline-block";
      if (signUpBtnMobile) signUpBtnMobile.style.display = "inline-block";
    }
  }

  // Attach logout event listeners (both desktop and mobile)
  if (logoutBtnDesktop) {
    logoutBtnDesktop.addEventListener("click", () => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          window.location.href = "/";
        });
    });
  }
  if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener("click", () => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          window.location.href = "/";
        });
    });
  }

  // Listen for auth state changes and update UI accordingly
  firebase.auth().onAuthStateChanged((user) => {
    // Make all auth buttons visible first (in case they were hidden by CSS)
    document.querySelectorAll(".nav-auth a").forEach((btn) => {
      btn.style.visibility = "visible";
    });

    setAuthButtons(user);
  });
});
