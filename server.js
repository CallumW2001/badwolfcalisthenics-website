const compression = require("compression");
const express = require("express");
const nodemailer = require("nodemailer");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const { title } = require("process");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const app = express();
const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));
const blogRoutes = require("./routes/blog");
const adminBlogRoutes = require("./routes/adminRoutes");
const competition = require("./routes/competitionRoutes");
const router = express.Router();
const admin = require("./routes/firebaseAdmin");
const authenticateFirebaseToken = require("./middleware/authenticate-firebase");

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
  const blogRoutes = require("./routes/blog");
  res.send(sitemap);
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.locals.canonical = `https://www.badwolfcalisthenics.com${req.originalUrl}`;
  next();
});

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("views", path.join(__dirname, "views"));
app.use(compression());
app.use(cookieParser());
app.use("/blog", blogRoutes); 
app.use("/admin", adminBlogRoutes);
app.use("/competition", competition);
app.use((req, res, next) => {
  const host = req.headers.host;
  if (host.includes(".elasticbeanstalk.com")) {
    return res.redirect(301, "https://www.badwolfcalisthenics.com" + req.url);
  }
  next();
});


app.use(express.static(path.join(__dirname, "public")));

app.set("layout", "layout"); 

const db = admin.firestore();

app.get("/", (req, res) => {
  res.render("index", {
    currentPage: "home",
    title: "Badwolf Calisthenics",
    description:
      "Official site of Badwolf Calisthenics — Calisthenics training, skills, and plans.",
    canonical: "https://www.badwolfcalisthenics.com/",
    query: req.query,
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

app.get("/your-training-plans", authenticateFirebaseToken, async (req, res) => {
  const userId = req.user.uid;
  const bucket = admin.storage().bucket();

  try {
    
    const [files] = await bucket.getFiles({
      prefix: `trainingPlans/${userId}/`,
    });

    
    const plans = await Promise.all(
      files.map(async (file) => {
        
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: Date.now() + 60 * 60 * 1000, 
        });

        return {
          fileName: file.name.split("/").pop(), 
          fileUrl: url,
        };
      })
    );

    res.render("your-training-plans", {
      currentPage: "your-training-plans",
      title: "Your Training Plans - Badwolf Calisthenics",
      description:
        "Personalized calisthenics training plans tailored just for you at Badwolf Calisthenics.",
      canonical: "https://www.badwolfcalisthenics.com/your-training-plans",
      plans,
      userEmail: req.user.email,
    });
  } catch (error) {
    console.error("Error fetching training plans:", error);
    res.status(500).send("Failed to load your training plans");
  }
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

app.post("/api/createUser", authenticateFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, email } = req.body;

    await db.collection("users").doc(userId).set({
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),

    });

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user document:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Please fill all fields" });
  }

  
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cwilko2022@gmail.com", 
      pass: "arcw bpzy lbdk vagi", 
    },
  });

 
  let mailOptions = {
    from: email, 
    to: "badwolfcalisthenics@gmail.com", 
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

app.post(
  "/admin/uploadTrainingPlan",
  authenticateFirebaseToken,
  upload.single("trainingPlan"),
  async (req, res) => {
    if (!req.user || !req.user.email)
      return res.status(401).send("Unauthorized");

    const adminEmails = ["cwilkinson2017@outlook.com"];
    if (!adminEmails.includes(req.user.email))
      return res.status(403).send("Forbidden");

    try {
      const targetEmail = req.body.targetEmail;
      const file = req.file;
      if (!targetEmail || !file) {
        return res.status(400).send("Missing email or file");
      }

      const usersRef = db.collection("users");
      const snapshot = await usersRef.where("email", "==", targetEmail).get();
      if (snapshot.empty) {
        return res.status(404).send("User not found");
      }
      const userDoc = snapshot.docs[0];
      const userId = userDoc.id;

      const bucket = admin.storage().bucket();
      const fileName = `trainingPlans/${userId}/${Date.now()}_${
        file.originalname
      }`;
      const fileUpload = bucket.file(fileName);
      await fileUpload.save(file.buffer, {
        metadata: { contentType: file.mimetype },
      });

      const [url] = await fileUpload.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });

      await db.collection("users").doc(userId).collection("trainingPlans").add({
        fileName: file.originalname,
        fileUrl: url,
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
        uploadedBy: req.user.email,
      });

      
      res.redirect("/?uploadSuccess=true");
    } catch (error) {
      console.error("Admin upload error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);


const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
