const admin = require("firebase-admin");
const serviceAccount = require("../MeetYourMentor/app/config/firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;