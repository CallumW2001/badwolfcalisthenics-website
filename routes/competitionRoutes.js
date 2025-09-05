const express = require("express");
const router = express.Router();
const authenticateFirebaseToken = require("../middleware/authenticate-firebase");
const admin = require("./firebaseAdmin");
const db = admin.firestore();

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

router.get("/submit", authenticateFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;

    const submissionsSnapshot = await db
      .collection("submissions")
      .where("userId", "==", uid)
      .limit(1)
      .get();

    if (!submissionsSnapshot.empty) {
      return res.redirect("/competition/leaderboard?alreadySubmitted=true");
    }

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
      alreadySubmitted: false,
    });
  } catch (error) {
    console.error("Error loading exercises:", error);
    res.status(500).send("Server error");
  }
});

router.post("/submit", authenticateFirebaseToken, async (req, res) => {
  try {
    const { uid, email, displayName } = req.user;
    const scores = req.body.scores || {};

    if (Object.keys(scores).length === 0) {
      return res.status(400).send("No scores submitted");
    }

    let alreadySubmitted = false;
    const batch = db.batch();

    for (const [exerciseId, points] of Object.entries(scores)) {
      const submissionRef = db
        .collection("submissions")
        .doc(`${uid}_${exerciseId}`);

      const doc = await submissionRef.get();
      if (doc.exists) {
        alreadySubmitted = true;
        break;
      }

      batch.set(submissionRef, {
        userId: uid,
        userEmail: email,
        userName: displayName,
        exerciseId,
        points: Number(points),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    if (alreadySubmitted) {
      return res.redirect("/competition/leaderboard?alreadySubmitted=true");
    }

    await batch.commit();
    return res.redirect("/competition/leaderboard?success=true");
  } catch (error) {
    console.error("Error submitting scores:", error.stack || error);
    res.status(500).send("Internal Server Error");
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
        name: userName || userEmail.split("@")[0],
      };
    }

    leaderboard[userEmail].total += Number(points);
  });

  let sorted = Object.entries(leaderboard)
    .map(([email, { total, name }]) => ({
      email,
      displayName: name,
      total,
    }))
    .sort((a, b) => b.total - a.total);

  sorted = sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  res.render("competition-leaderboard", {
    leaderboard: sorted,
    currentPage: "competition",
    title: "Competition Leaderboard - Badwolf Calisthenics",
    description: "View calisthenics competition leaderboard",
    canonical: "https://www.badwolfcalisthenics.com/competition/leaderboard",
  });
});

module.exports = router;
