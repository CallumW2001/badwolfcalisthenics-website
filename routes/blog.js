const express = require("express");
const router = express.Router();
const admin = require("./firebaseAdmin");
const authenticateFirebaseToken = require("../middleware/authenticate-firebase");
const db = admin.firestore();

function checkAdmin(req, res, next) {
  const adminEmails = ["cwilkinson2017@outlook.com"];
  if (!req.user || !adminEmails.includes(req.user.email)) {
    return res.status(403).send("Forbidden");
  }
  next();
}

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("posts").get();
    const posts = snapshot.docs.map((doc) => ({ slug: doc.id, ...doc.data() }));

    res.render("blog", {
      currentPage: "blog",
      title: "Blog - Badwolf Calisthenics",
      description:
        "Read the latest articles and updates from Badwolf Calisthenics. Explore our blog for tips, workouts, and insights into the world of calisthenics.",
      canonical: "https://www.badwolfcalisthenics.com/blog",
      posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("Server error");
  }
});

router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const doc = await db.collection("posts").doc(slug).get();

    if (!doc.exists) {
      return res.status(404).render("404", {
        message: "Post not found",
        currentPage: "404",
        title: "Error 404 - Not Found",
        description: "The post you are looking for does not exist.",
        canonical: "https://www.badwolfcalisthenics.com/404",
      });
    }

    const post = { slug: doc.id, ...doc.data() };

    res.render("post", {
      currentPage: "blog",
      title: post.title,
      description: post.description || "",
      canonical: `https://www.badwolfcalisthenics.com/blog/${slug}`,
      post,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
