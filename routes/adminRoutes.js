const express = require("express");
const router = express.Router();
const admin = require("./firebaseAdmin");
const authenticateFirebaseToken = require("../middleware/authenticate-firebase");
const db = admin.firestore();

// Middleware to check if user is admin
function checkAdmin(req, res, next) {
  const adminEmails = ["cwilkinson2017@outlook.com", "badwolfcalisthenics@gmail.com"];
  if (!req.user || !adminEmails.includes(req.user.email)) {
    return res.status(403).send("Forbidden");
  }
  next();
}

// ADMIN ROUTES — use router, not app!

// List all posts (admin)
router.get("/blog", authenticateFirebaseToken, checkAdmin, async (req, res) => {
  try {
    const postsSnapshot = await db.collection("posts").get();
    const posts = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.render("admin-post-list", {
      posts,
      currentPage: "blog",
      title: "Admin Blog - Badwolf Calisthenics",
      description: "Manage your blog posts",
      canonical: "https://www.badwolfcalisthenics.com/admin/blog",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Show create post form (admin)
router.get(
  "/blog/create",
  authenticateFirebaseToken,
  checkAdmin,
  (req, res) => {
    res.render("admin-post-create", {
      currentPage: "blog",
      title: "Create Post - Badwolf Calisthenics",
      description: "Create a new blog post",
      canonical: "https://www.badwolfcalisthenics.com/admin/blog/create",
    });
  }
);

// Handle create post form submission (admin)
router.post(
  "/blog/create",
  authenticateFirebaseToken,
  checkAdmin,
  async (req, res) => {
    const { slug, title, description, content, author } = req.body;
    try {
      await db.collection("posts").doc(slug).set({
        title,
        description,
        content,
        author,
        publishedAt: admin.firestore.Timestamp.now(),
      });
      res.redirect("/admin/blog");
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

// Show edit post form (admin)
router.get(
  "/blog/edit/:slug",
  authenticateFirebaseToken,
  checkAdmin,
  async (req, res) => {
    try {
      const doc = await db.collection("posts").doc(req.params.slug).get();
      if (!doc.exists) return res.status(404).send("Post not found");
      res.render("admin-post-edit", { post: { slug: doc.id, ...doc.data() }, currentPage: "blog",
      title: "Edit Post - Badwolf Calisthenics",
      description: `Edit blog post - ${req.params.slug}`,
      canonical: `https://www.badwolfcalisthenics.com/admin/blog/edit/${req.params.slug}`, });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

// Handle edit post form submission (admin)
router.post(
  "/blog/edit/:slug",
  authenticateFirebaseToken,
  checkAdmin,
  async (req, res) => {
    const { title, description, content, author } = req.body;
    try {
      await db.collection("posts").doc(req.params.slug).update({
        title,
        description,
        content,
        author,
      });
      res.redirect("/admin/blog");
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

// Handle delete post (admin)
router.post(
  "/blog/delete/:slug",
  authenticateFirebaseToken,
  checkAdmin,
  async (req, res) => {
    try {
      await db.collection("posts").doc(req.params.slug).delete();
      res.redirect("/admin/blog");
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
