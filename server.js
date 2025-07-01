const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Route for homepage
app.get("/", (req, res) => {
  res.render("index", { currentPage: "home" });
});

app.get("/about", (req, res) => {
  res.render("about", { currentPage: "about" }); // views/about.ejs
});

app.get("/skills", (req, res) => {
  res.render("skills", { currentPage: "skills" }); // views/about.ejs
});

app.get("/reviews", (req, res) => {
  res.render("reviews", { currentPage: "reviews" }); // views/about.ejs
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    sent: req.query.sent === "true",
    error: req.query.error === "true",
    currentPage: "contact",
  });
});

app.get("/login", (req, res) => {
  res.render("login"); // views/about.ejs
});

app.get("/signup", (req, res) => {
  res.render("signup"); // views/about.ejs
});

// POST route to handle contact form submissions
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Please fill all fields" });
  }

  // Create transporter object using SMTP (example uses Gmail SMTP)
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cwilko2022@gmail.com", // Your email address
      pass: "arcw bpzy lbdk vagi", // Your email app password (use app password if 2FA enabled)
    },
  });

  // Email options
  let mailOptions = {
    from: email, // sender address (the user email)
    to: "badwolfcalisthenics@gmail.com", // receiver address (your inbox)
    subject: `New contact form message from ${name}`,
    text: message,
    html: `<p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Message:</strong><br/>${message}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to send message." });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
