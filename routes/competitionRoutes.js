const express = require("express");
const router = express.Router();
const authenticateFirebaseToken = require("../middleware/authenticate-firebase");
const admin = require("./firebaseAdmin");
const db = admin.firestore();

// GET: Competition overview page
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("competitionExercises").get();
    const exercises = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.render("competition", {
      exercises,
      currentPage: "competition",
      title: "Competition Exercises - Badwolf Calisthenics",
      description: "View calisthenics competition exercises",
      canonical: "https://www.badwolfcalisthenics.com/competition",
    });
  } catch (error) {
    console.error("Error loading competition data:", error);
    res.status(500).send("Server error");
  }
});

// GET: List all exercises
// GET: List all exercises
router.get("/exercises", async (req, res) => {
  try {
    const snapshot = await db.collection("competitionExercises").get();
    const exercises = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.render("competition-exercises", {
      exercises,
      currentPage: "competition",
      title: "Competition Exercises - Badwolf Calisthenics",
      description: "View calisthenics competition exercises",
      canonical: "https://www.badwolfcalisthenics.com/competition/exercises",
    });
  } catch (error) {
    console.error("Error loading competition exercises:", error);
    res.status(500).send("Server error");
  }
});

// GET: Submission form
router.get("/submit", authenticateFirebaseToken, async (req, res) => {
  try {
    const snapshot = await db.collection("competitionExercises").get();
    const exercises = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.render("competition-submit", {
      exercises,
      currentPage: "competition",
      title: "Submit Your Scores - Badwolf Calisthenics",
      description: "Submit your competition scores",
      canonical: "https://www.badwolfcalisthenics.com/competition/submit",
    });
  } catch (error) {
    console.error("Error loading exercises:", error);
    res.status(500).send("Server error");
  }
});

// POST: Submit scores
router.post("/submit", authenticateFirebaseToken, async (req, res) => {
  try {
    const { user_id, email } = req.user;
    const displayName = req.user.displayName;
    const scores = req.body.scores || {}; // fallback to empty object

    if (Object.keys(scores).length === 0) {
      return res.status(400).send("No scores submitted");
    }

    const batch = db.batch();

    for (const [exerciseId, points] of Object.entries(scores)) {
      const submissionRef = db
        .collection("submissions")
        .doc(`${user_id}_${exerciseId}`);

      const doc = await submissionRef.get();
      if (doc.exists) continue; // prevent double submission

      batch.set(submissionRef, {
        userId: user_id,
        userEmail: email,
        userName: displayName,
        exerciseId,
        points: Number(points),
        timestamp: new Date(),
      });
    }

    await batch.commit();

    res.redirect("/competition/leaderboard");
  } catch (error) {
    console.error("Error submitting scores:", error);
    res.status(500).send("Server error");
  }
});

router.get("/leaderboard", async (req, res) => {
  const snapshot = await db.collection("submissions").get();

  const leaderboard = {};

  snapshot.forEach((doc) => {
    const { userEmail, points, userName } = doc.data();

    if (!leaderboard[userEmail]) {
      leaderboard[userEmail] = {
        total: 0,
        name: userName || userEmail.split("@")[0], // fallback name
      };
    }

    leaderboard[userEmail].total += Number(points);
  });

  // Convert to array & sort
  const sorted = Object.entries(leaderboard)
    .map(([email, { total, name }]) => ({
      email,
      displayName: name,
      total,
    }))
    .sort((a, b) => b.total - a.total);

  res.render("competition-leaderboard", {
    leaderboard: sorted,
    currentPage: "competition",
    title: "Competition Leaderboard - Badwolf Calisthenics",
    description: "View calisthenics competition leaderboard",
    canonical: "https://www.badwolfcalisthenics.com/competition/leaderboard",
  });
});

module.exports = router;
