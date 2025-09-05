const form = document.getElementById("contact-form");
const successMessage = document.getElementById("success-message");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Hide messages on new submit
  successMessage.style.display = "none";
  errorMessage.style.display = "none";

  const formData = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value,
  };

  try {
    const response = await fetch("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      successMessage.style.display = "block";
      errorMessage.style.display = "none";
      form.reset();
    } else {
      successMessage.style.display = "none";
      errorMessage.textContent =
        result.error || "Failed to send message. Please try again.";
      errorMessage.style.display = "block";
    }
  } catch (error) {
    successMessage.style.display = "none";
    errorMessage.textContent = "Failed to send message. Please try again.";
    errorMessage.style.display = "block";
    console.error(error);
  }
});
