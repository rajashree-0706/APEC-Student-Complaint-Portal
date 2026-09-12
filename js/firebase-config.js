import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyANVQ17jvWgauKV3QrqnDOOPXsWVYixyBE",
    authDomain: "apec-student-complaint-portal.firebaseapp.com",
    projectId: "apec-student-complaint-portal",
    storageBucket: "apec-student-complaint-portal.firebasestorage.app",
    messagingSenderId: "984177338609",
    appId: "1:984177338609:web:9b00fd25a9fc22b4cda150"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };