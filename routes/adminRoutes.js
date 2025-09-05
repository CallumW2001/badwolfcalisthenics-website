const express = require("express");
const router = express.Router();
const admin = require("./firebaseAdmin");
const authenticateFirebaseToken = require("../middleware/authenticate-firebase");
const db = admin.firestore();

function checkAdmin(req, res, next) {
  const adminEmails = [
    "cwilkinson2017@outlook.com",
    "badwolfcalisthenics@gmail.com",
  ];
  if (!req.user || !adminEmails.includes(req.user.email)) {
    return res.status(403).send("Forbidden");
  }
  next();
}

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

router.get(
  "/blog/edit/:slug",
  authenticateFirebaseToken,
  checkAdmin,
  async (req, res) => {
    try {
      const doc = await db.collection("posts").doc(req.params.slug).get();
      if (!doc.exists) return res.status(404).send("Post not found");
      res.render("admin-post-edit", {
        post: { slug: doc.id, ...doc.data() },
        currentPage: "blog",
        title: "Edit Post - Badwolf Calisthenics",
        description: `Edit blog post - ${req.params.slug}`,
        canonical: `https://www.badwolfcalisthenics.com/admin/blog/edit/${req.params.slug}`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

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

router.get(
  "/competition",
  authenticateFirebaseToken,
  checkAdmin,
  async (req, res) => {
    const snapshot = await db.collection("competitionExercises").get();
    const exercises = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.render("admin-competition", {
      exercises,
      currentPage: "admin",
      title: "Admin Portal - Badwolf Calisthenics",
      description: "Admin Activities",
      canonical: "https://www.badwolfcalisthenics.com/admin/competition",
    });
  }
);

router.get(
  "/competition/new",
  authenticateFirebaseToken,
  checkAdmin,
  (req, res) => {
    res.render("admin-competition-new", {
      currentPage: "admin",
      title: "Create Exercises - Badwolf Calisthenics",
      description: "Create a new exercises for competition",
      canonical: "https://www.badwolfcalisthenics.com/admin/competition/new",
    });
  }
);

router.post(
  "/competition/new",
  authenticateFirebaseToken,
  checkAdmin,
  async (req, res) => {
    const { id, name, description, maxPoints } = req.body;
    await db
      .collection("competitionExercises")
      .doc(id)
      .set({
        name,
        description,
        maxPoints: Number(maxPoints),
      });
    res.redirect("/admin/competition");
  }
);

router.post(
  "/competition/delete/:id",
  authenticateFirebaseToken,
  checkAdmin,
  async (req, res) => {
    await db.collection("competitionExercises").doc(req.params.id).delete();
    res.redirect("/admin/competition");
  }
);

module.exports = router;
