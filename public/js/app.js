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
          window.location.href = "login.html";
        });
    });
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const navAuth = document.querySelector(".nav-auth");
  const signInBtn = document.getElementById("sign-in-btn");
  const signUpBtn = document.getElementById("sign-up-btn");
  const logoutBtn = document.getElementById("logout-btn");

  firebase.auth().onAuthStateChanged((user) => {
    // Show auth nav only after we know the auth state
    navAuth.classList.add("js-ready");

    if (user) {
      logoutBtn.style.display = "inline-flex";
      signInBtn.style.display = "none";
      signUpBtn.style.display = "none";
    } else {
      logoutBtn.style.display = "none";
      signInBtn.style.display = "inline-flex";
      signUpBtn.style.display = "inline-flex";
    }
  });
});
