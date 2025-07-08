const admin = require("../routes/firebaseAdmin");

async function authenticateFirebaseToken(req, res, next) {
  const idToken =
    req.headers.authorization?.split("Bearer ")[1] || req.cookies.token;

  if (!idToken) {
    return res.status(401).send("No token provided");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Fetch full user record from Firebase
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    req.user = {
      user_id: decodedToken.uid,
      email: decodedToken.email,
      displayName: userRecord.displayName || "", // safe fallback
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).send("Unauthorized");
  }
}

module.exports = authenticateFirebaseToken;
