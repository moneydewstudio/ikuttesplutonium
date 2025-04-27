// setAdmin.js
const admin = require('firebase-admin');
admin.initializeApp();

const uid = 'B73Zm2ed3dWyPKX5GyfFYf8GHBV2';
admin.auth().setCustomUserClaims(uid, { admin: true }).then(() => {
  console.log('Admin claim set for user', uid);
  process.exit(0);
});