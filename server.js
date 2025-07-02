const express = require("express");
const nodemailer = require("nodemailer");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const { title } = require("process");

const app = express();

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("views", path.join(__dirname, "views"));

app.use((req, res, next) => {
  const host = req.headers.host;
  if (host.includes(".elasticbeanstalk.com")) {
    return res.redirect(301, "https://www.badwolfcalisthenics.com" + req.url);
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.set("layout", "layout"); // Default layout file: views/layout.ejs

// Route for homepage
app.get("/", (req, res) => {
  res.render("index", { currentPage: "home", title: "Badwolf Calisthenics" });
});

app.get("/about", (req, res) => {
  res.render("about", { currentPage: "about", title: "About" });
});

app.get("/skills", (req, res) => {
  res.render("skills", { currentPage: "skills", title: "Skills" });
});

app.get("/reviews", (req, res) => {
  res.render("reviews", { currentPage: "reviews", title: "Reviews" });
});

app.get("/your-training-plans", (req, res) => {
  res.render("your-training-plans", {
    currentPage: "your-training-plans",
    title: "Your Training Plans",
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    sent: req.query.sent === "true",
    error: req.query.error === "true",
    currentPage: "contact",
    title: "Contact Us",
  });
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Login", currentPage: "login" });
});

app.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign Up", currentPage: "signup" });
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

//Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
