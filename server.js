const compression = require("compression");

const express = require("express");
const nodemailer = require("nodemailer");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const { title } = require("process");

const app = express();

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.locals.canonical = `https://www.badwolfcalisthenics.com${req.originalUrl}`;
  next();
});

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("views", path.join(__dirname, "views"));
app.use(compression());

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

app.get("/", (req, res) => {
  res.render("index", {
    currentPage: "home",
    title: "Badwolf Calisthenics",
    description:
      "Official site of Badwolf Calisthenics — Calisthenics training, skills, and plans.",
    canonical: "https://www.badwolfcalisthenics.com/",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    currentPage: "about",
    title: "About Badwolf Calisthenics",
    description:
      "Learn more about Badwolf Calisthenics and our mission to improve your fitness.",
    canonical: "https://www.badwolfcalisthenics.com/about",
  });
});

app.get("/skills", (req, res) => {
  res.render("skills", {
    currentPage: "skills",
    title: "Calisthenics Skills - Badwolf Calisthenics",
    description:
      "Explore and master your calisthenics skills with Badwolf Calisthenics training programs.",
    canonical: "https://www.badwolfcalisthenics.com/skills",
  });
});

app.get("/reviews", (req, res) => {
  res.render("reviews", {
    currentPage: "reviews",
    title: "Reviews - Badwolf Calisthenics",
    description:
      "Read testimonials and reviews from our satisfied calisthenics community.",
    canonical: "https://www.badwolfcalisthenics.com/reviews",
  });
});

app.get("/your-training-plans", (req, res) => {
  res.render("your-training-plans", {
    currentPage: "your-training-plans",
    title: "Your Training Plans - Badwolf Calisthenics",
    description:
      "Personalized calisthenics training plans tailored just for you at Badwolf Calisthenics.",
    canonical: "https://www.badwolfcalisthenics.com/your-training-plans",
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    sent: req.query.sent === "true",
    error: req.query.error === "true",
    currentPage: "contact",
    title: "Contact Us - Badwolf Calisthenics",
    description:
      "Get in touch with Badwolf Calisthenics for questions, feedback, or support.",
    canonical: "https://www.badwolfcalisthenics.com/contact",
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    currentPage: "login",
    title: "Login - Badwolf Calisthenics",
    description:
      "Log in to your Badwolf Calisthenics account to access your training plans and more.",
    canonical: "https://www.badwolfcalisthenics.com/login",
  });
});

app.get("/signup", (req, res) => {
  res.render("signup", {
    currentPage: "signup",
    title: "Sign Up - Badwolf Calisthenics",
    description:
      "Create your Badwolf Calisthenics account and start your calisthenics journey today.",
    canonical: "https://www.badwolfcalisthenics.com/signup",
  });
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

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Disallow: /login
Disallow: /signup
Allow: /`);
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");

  const urls = [
    { url: "", priority: 1.0 },
    { url: "about", priority: 0.8 },
    { url: "skills", priority: 0.8 },
    { url: "reviews", priority: 0.7 },
    { url: "your-training-plans", priority: 0.7 },
    { url: "contact", priority: 0.6 },
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  urls.forEach(({ url, priority }) => {
    sitemap += `
    <url>
      <loc>https://www.badwolfcalisthenics.com/${url}</loc>
      <changefreq>weekly</changefreq>
      <priority>${priority}</priority>
    </url>`;
  });

  sitemap += `</urlset>`;
  res.send(sitemap);
});

//Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
