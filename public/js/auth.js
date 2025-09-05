document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginError = document.getElementById("login-error");
  const signupError = document.getElementById("signup-error");
  const forgotPasswordLink = document.getElementById("forgot-password-link");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          window.location.href = "/";
        })
        .catch((error) => {
          if (loginError) loginError.textContent = error.message;
        });
    });

    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        if (!email) {
          loginError.textContent = "Please enter your email to reset password.";
          return;
        }

        firebase
          .auth()
          .sendPasswordResetEmail(email)
          .then(() => {
            loginError.style.color = "#FFFFFF";
            loginError.textContent = "Password reset email sent!";
          })
          .catch((error) => {
            loginError.style.color = "red";
            loginError.textContent = error.message;
          });
      });
    }
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          return user.updateProfile({ displayName: name }).then(() => user);
        })
        .then((user) => {
          // Call your server to create the user document
          return fetch("/api/createUser", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: user.displayName,
              email: user.email,
            }),
            credentials: "include", // send cookies including auth token
          });
        })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to create user in DB");
          window.location.href = "/";
        })
        .catch((error) => {
          if (signupError) signupError.textContent = error.message;
        });
    });
  }
});
