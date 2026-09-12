// ==========================================
// APEC STUDENT COMPLAINT PORTAL
// Authentication & Role Management
// ==========================================

import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ==========================================
// ELEMENTS
// ==========================================

const loginForm = document.getElementById("loginForm");

const studentRole = document.getElementById("studentRole");
const adminRole = document.getElementById("adminRole");

const registerLink = document.getElementById("registerLink");


// Default role
let selectedRole = "student";


// ==========================================
// ROLE SWITCH
// ==========================================

if (studentRole) {

    studentRole.addEventListener("click", () => {

        selectedRole = "student";

        studentRole.classList.add("active");

        if (adminRole) {
            adminRole.classList.remove("active");
        }

    });

}


if (adminRole) {

    adminRole.addEventListener("click", () => {

        selectedRole = "admin";

        adminRole.classList.add("active");

        if (studentRole) {
            studentRole.classList.remove("active");
        }

    });

}


// ==========================================
// LOGIN
// ==========================================

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email =
            document.getElementById("email")?.value.trim();

        const password =
            document.getElementById("password")?.value;


        if (!email || !password) {

            showAuthMessage(
                "Please enter your email and password.",
                "error"
            );

            return;
        }


        const loginButton =
            loginForm.querySelector('button[type="submit"]');


        try {

            if (loginButton) {

                loginButton.disabled = true;
                loginButton.textContent = "Signing in...";

            }


            // Firebase Authentication
            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            // ======================================
            // GET USER PROFILE FROM FIRESTORE
            // ======================================

            const userRef =
                doc(db, "users", user.uid);

            const userSnapshot =
                await getDoc(userRef);


            if (!userSnapshot.exists()) {

                showAuthMessage(
                    "User profile not found. Please contact the administrator.",
                    "error"
                );

                await auth.signOut();

                return;
            }


            const profile =
                userSnapshot.data();


            const actualRole =
                profile.role || "student";


            // ======================================
            // SECURITY CHECK
            // ======================================

            if (
                selectedRole === "admin" &&
                actualRole !== "admin"
            ) {

                showAuthMessage(
                    "Admin access denied. This account is not an administrator.",
                    "error"
                );

                await auth.signOut();

                return;
            }


            if (
                selectedRole === "student" &&
                actualRole === "admin"
            ) {

                showAuthMessage(
                    "Please use the Admin login option for this account.",
                    "error"
                );

                await auth.signOut();

                return;
            }


            // ======================================
            // SAVE USER SESSION
            // ======================================

            const currentUser = {

                uid: user.uid,

                email: user.email,

                role: actualRole,

                name:
                    profile.name ||
                    "APEC Student",

                studentId:
                    profile.studentId ||
                    "",

                department:
                    profile.department ||
                    "",

                year:
                    profile.year ||
                    ""

            };


            localStorage.setItem(
                "currentUser",
                JSON.stringify(currentUser)
            );


            showAuthMessage(
                "Login successful. Redirecting...",
                "success"
            );


            // ======================================
            // REDIRECT
            // ======================================

            setTimeout(() => {

                if (actualRole === "admin") {

                    window.location.href =
                        "admin.html";

                } else {

                    window.location.href =
                        "student.html";

                }

            }, 700);


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            let message =
                "Unable to sign in. Please try again.";


            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                message =
                    "Incorrect email or password.";

            }

            else if (
                error.code ===
                "auth/user-not-found"
            ) {

                message =
                    "No account found with this email.";

            }

            else if (
                error.code ===
                "auth/wrong-password"
            ) {

                message =
                    "Incorrect password.";

            }

            else if (
                error.code ===
                "auth/invalid-email"
            ) {

                message =
                    "Please enter a valid email address.";

            }

            else if (
                error.code ===
                "auth/too-many-requests"
            ) {

                message =
                    "Too many attempts. Please try again later.";

            }


            showAuthMessage(
                message,
                "error"
            );


        } finally {

            if (loginButton) {

                loginButton.disabled = false;
                loginButton.textContent = "Sign In";

            }

        }

    });

}


// ==========================================
// STUDENT REGISTRATION
// ==========================================

if (registerLink) {

    registerLink.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            // --------------------------------------
            // STUDENT DETAILS
            // --------------------------------------

            const name =
                prompt("Enter your full name:");

            if (!name) return;


            const studentId =
                prompt("Enter your Student ID:");

            if (!studentId) return;


            const department =
                prompt("Enter your Department:");

            if (!department) return;


            const year =
                prompt(
                    "Enter your Year (1 / 2 / 3 / 4):"
                );

            if (!year) return;


            const email =
                prompt("Enter your email address:");

            if (!email) return;


            const password =
                prompt(
                    "Create a password (minimum 6 characters):"
                );

            if (!password) return;


            if (password.length < 6) {

                showAuthMessage(
                    "Password must contain at least 6 characters.",
                    "error"
                );

                return;
            }


            try {

                // ----------------------------------
                // CREATE FIREBASE AUTH ACCOUNT
                // ----------------------------------

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email.trim(),
                        password
                    );


                const user =
                    credential.user;


                // ----------------------------------
                // CREATE FIRESTORE PROFILE
                // ----------------------------------

                await setDoc(
                    doc(db, "users", user.uid),
                    {

                        uid: user.uid,

                        name:
                            name.trim(),

                        studentId:
                            studentId.trim(),

                        email:
                            email.trim(),

                        department:
                            department.trim(),

                        year:
                            year.trim(),

                        // IMPORTANT:
                        // Registration can ONLY create student accounts.
                        role: "student",

                        createdAt:
                            serverTimestamp()

                    }
                );


                // ----------------------------------
                // SAVE LOCAL SESSION
                // ----------------------------------

                const currentUser = {

                    uid: user.uid,

                    email: user.email,

                    role: "student",

                    name: name.trim(),

                    studentId: studentId.trim(),

                    department: department.trim(),

                    year: year.trim()

                };


                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(currentUser)
                );


                showAuthMessage(
                    "Registration successful! Opening Student Dashboard...",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "student.html";

                }, 900);


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                let message =
                    "Unable to create account.";


                if (
                    error.code ===
                    "auth/email-already-in-use"
                ) {

                    message =
                        "This email is already registered.";

                }

                else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    message =
                        "Please enter a valid email address.";

                }

                else if (
                    error.code ===
                    "auth/weak-password"
                ) {

                    message =
                        "Password is too weak.";

                }


                showAuthMessage(
                    message,
                    "error"
                );

            }

        }
    );

}


// ==========================================
// AUTH MESSAGE
// ==========================================

function showAuthMessage(
    message,
    type = "success"
) {

    let messageBox =
        document.getElementById(
            "authMessage"
        );


    // Create message box if HTML
    // doesn't already contain one

    if (!messageBox) {

        messageBox =
            document.createElement("div");

        messageBox.id =
            "authMessage";

        messageBox.style.marginTop =
            "14px";

        messageBox.style.padding =
            "11px 14px";

        messageBox.style.borderRadius =
            "10px";

        messageBox.style.fontSize =
            "12px";

        messageBox.style.fontWeight =
            "700";


        if (loginForm) {

            loginForm.appendChild(
                messageBox
            );

        } else {

            document.body.appendChild(
                messageBox
            );

        }

    }


    messageBox.textContent =
        message;


    if (type === "error") {

        messageBox.style.background =
            "#fff1f1";

        messageBox.style.color =
            "#b42318";

        messageBox.style.border =
            "1px solid #f5cccc";

    } else {

        messageBox.style.background =
            "#edf8f2";

        messageBox.style.color =
            "#126b4f";

        messageBox.style.border =
            "1px solid #cce9da";

    }


    messageBox.style.display =
        "block";

}


// ==========================================
// CLEAR SESSION HELPER
// ==========================================

export function logoutUser() {

    localStorage.removeItem(
        "currentUser"
    );

    localStorage.removeItem(
        "lastComplaintId"
    );

    auth.signOut()
        .then(() => {

            window.location.href =
                "login.html";

        });

}