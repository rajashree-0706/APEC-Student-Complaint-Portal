// ==========================================
// APEC STUDENT COMPLAINT PORTAL
// Complaint Submission Engine
// ==========================================

import { auth, db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";

import {
    generateComplaintId,
    calculatePriority,
    getDepartment,
    showToast
} from "./utils.js";


// ==========================================
// FIREBASE STORAGE
// ==========================================

const storage = getStorage();


// ==========================================
// ELEMENTS
// ==========================================

const complaintForm =
    document.getElementById("complaintForm");

const categoryInput =
    document.getElementById("category");

const descriptionInput =
    document.getElementById("description");


// ==========================================
// GET LOGGED-IN STUDENT
// ==========================================

function getCurrentStudent() {

    const savedUser =
        localStorage.getItem("currentUser");

    if (!savedUser) {
        return null;
    }

    try {

        return JSON.parse(savedUser);

    } catch (error) {

        console.error(
            "Invalid user session:",
            error
        );

        return null;
    }
}


// ==========================================
// SMART ANALYSIS
// ==========================================

function updateSmartAnalysis() {

    if (
        !categoryInput ||
        !descriptionInput
    ) {
        return;
    }


    const category =
        categoryInput.value;

    const description =
        descriptionInput.value;


    if (!category) {
        return;
    }


    const result =
        calculatePriority(
            category,
            description
        );


    const department =
        getDepartment(category);


    const analysisItems =
        document.querySelectorAll(
            ".smart-item strong"
        );


    if (analysisItems.length >= 3) {

        analysisItems[0].textContent =
            category;

        analysisItems[1].textContent =
            result.priority;

        analysisItems[2].textContent =
            department;

    }

}


// ==========================================
// SMART ANALYSIS EVENTS
// ==========================================

if (categoryInput) {

    categoryInput.addEventListener(
        "change",
        updateSmartAnalysis
    );

}


if (descriptionInput) {

    descriptionInput.addEventListener(
        "input",
        updateSmartAnalysis
    );

}


// ==========================================
// FILE VALIDATION
// ==========================================

function validateEvidence(file) {

    if (!file) {
        return true;
    }


    const maxSize =
        5 * 1024 * 1024;


    if (file.size > maxSize) {

        showToast(
            "Evidence file must be below 5MB.",
            "error"
        );

        return false;
    }


    const allowedTypes = [

        "image/jpeg",

        "image/png",

        "application/pdf"

    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        showToast(
            "Only JPG, PNG or PDF files are allowed.",
            "error"
        );

        return false;
    }


    return true;

}


// ==========================================
// UPLOAD EVIDENCE
// ==========================================

async function uploadEvidence(
    file,
    complaintId
) {

    if (!file) {
        return {
            url: "",
            fileName: "",
            fileType: ""
        };
    }


    const safeFileName =
        file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );


    const storagePath =
        `complaints/${complaintId}/${Date.now()}_${safeFileName}`;


    const storageReference =
        ref(
            storage,
            storagePath
        );


    await uploadBytes(
        storageReference,
        file
    );


    const downloadURL =
        await getDownloadURL(
            storageReference
        );


    return {

        url: downloadURL,

        fileName: file.name,

        fileType: file.type,

        storagePath

    };

}


// ==========================================
// FORM SUBMISSION
// ==========================================

if (complaintForm) {

    complaintForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==================================
            // AUTHENTICATED STUDENT
            // ==================================

            const currentStudent =
                getCurrentStudent();


            if (
                !currentStudent ||
                !auth.currentUser
            ) {

                showToast(
                    "Please login before submitting a complaint.",
                    "error"
                );

                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1000);

                return;
            }


            // ==================================
            // FORM VALUES
            // ==================================

            const title =
                document
                    .getElementById("title")
                    ?.value
                    .trim();


            const category =
                document
                    .getElementById("category")
                    ?.value;


            const subCategory =
                document
                    .getElementById("subcategory")
                    ?.value
                    .trim();


            const description =
                document
                    .getElementById("description")
                    ?.value
                    .trim();


            const location =
                document
                    .getElementById("location")
                    ?.value
                    .trim();


            const room =
                document
                    .getElementById("room")
                    ?.value
                    .trim();


            const anonymous =
                document
                    .getElementById("anonymous")
                    ?.checked || false;


            const evidence =
                document
                    .getElementById("evidence")
                    ?.files[0];


            // ==================================
            // VALIDATION
            // ==================================

            if (!title) {

                showToast(
                    "Please enter a complaint title.",
                    "error"
                );

                return;
            }


            if (!category) {

                showToast(
                    "Please select a complaint category.",
                    "error"
                );

                return;
            }


            if (!description) {

                showToast(
                    "Please describe your complaint.",
                    "error"
                );

                return;
            }


            if (
                evidence &&
                !validateEvidence(evidence)
            ) {

                return;
            }


            // ==================================
            // SMART ENGINE
            // ==================================

            const priorityResult =
                calculatePriority(
                    category,
                    description
                );


            const assignedDepartment =
                getDepartment(category);


            const complaintId =
                generateComplaintId();


            // ==================================
            // SUBMIT BUTTON
            // ==================================

            const submitButton =
                complaintForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.innerHTML =
                    "Submitting...";

            }


            try {

                // ==================================
                // UPLOAD EVIDENCE FIRST
                // ==================================

                let evidenceData = {

                    url: "",

                    fileName: "",

                    fileType: "",

                    storagePath: ""

                };


                if (evidence) {

                    if (submitButton) {

                        submitButton.innerHTML =
                            "Uploading Evidence...";

                    }


                    evidenceData =
                        await uploadEvidence(
                            evidence,
                            complaintId
                        );

                }


                // ==================================
                // COMPLAINT DATA
                // ==================================

                const complaintData = {

                    complaintId,

                    // Real logged-in student
                    studentId:
                        currentStudent.studentId || "",

                    studentUid:
                        currentStudent.uid ||
                        auth.currentUser.uid,

                    studentName:
                        anonymous
                            ? "Confidential Student"
                            : (
                                currentStudent.name ||
                                "APEC Student"
                            ),

                    studentEmail:
                        anonymous
                            ? ""
                            : (
                                currentStudent.email ||
                                auth.currentUser.email ||
                                ""
                            ),


                    category,

                    subCategory:
                        subCategory || "",

                    title,

                    description,


                    location: {

                        block:
                            location || "",

                        room:
                            room || ""

                    },


                    // Smart Engine
                    priority:
                        priorityResult.priority,

                    priorityScore:
                        priorityResult.score,

                    assignedDepartment,


                    // Status
                    status:
                        "Submitted",


                    // Confidential complaint
                    isAnonymous:
                        anonymous,


                    // Evidence
                    evidenceUrl:
                        evidenceData.url,

                    evidenceFileName:
                        evidenceData.fileName,

                    evidenceFileType:
                        evidenceData.fileType,

                    evidenceStoragePath:
                        evidenceData.storagePath,


                    // Timestamps
                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp(),


                    // Escalation
                    escalationLevel:
                        0

                };


                // ==================================
                // SAVE TO FIRESTORE
                // ==================================

                if (submitButton) {

                    submitButton.innerHTML =
                        "Saving Complaint...";

                }


                await addDoc(
                    collection(
                        db,
                        "complaints"
                    ),
                    complaintData
                );


                // ==================================
                // SAVE LAST COMPLAINT
                // ==================================

                localStorage.setItem(
                    "lastComplaintId",
                    complaintId
                );


                // ==================================
                // SUCCESS
                // ==================================

                showToast(
                    `Complaint submitted successfully! ID: ${complaintId}`,
                    "success"
                );


                complaintForm.reset();


                updateSmartAnalysis();


                // ==================================
                // REDIRECT TO TRACKING
                // ==================================

                setTimeout(() => {

                    window.location.href =
                        `track.html?id=${encodeURIComponent(
                            complaintId
                        )}`;

                }, 1400);


            } catch (error) {

                console.error(
                    "Complaint submission error:",
                    error
                );


                let message =
                    "Unable to submit complaint. Please try again.";


                if (
                    error.code ===
                    "storage/unauthorized"
                ) {

                    message =
                        "Evidence upload permission denied. Check Firebase Storage rules.";

                }


                showToast(
                    message,
                    "error"
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.innerHTML =
                        "Submit Complaint";

                }

            }

        }
    );

}


// ==========================================
// INITIAL SMART ANALYSIS
// ==========================================

updateSmartAnalysis();