// ==========================================
// APEC STUDENT COMPLAINT PORTAL
// STUDENT DASHBOARD ENGINE
// ==========================================

import { db } from "./firebase-config.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        protectStudentPage();

        loadStudentProfile();

        loadStudentDashboard();

        setupQuickActions();

    }
);


// ==========================================
// STUDENT PAGE PROTECTION
// ==========================================

function protectStudentPage() {

    const savedUser =
        localStorage.getItem(
            "currentUser"
        );


    if (!savedUser) {

        window.location.href =
            "login.html";

        return;

    }


    try {

        const user =
            JSON.parse(savedUser);


        if (
            user.role ===
            "admin"
        ) {

            window.location.href =
                "admin.html";

        }

    } catch (error) {

        console.error(
            "Invalid session:",
            error
        );

        localStorage.removeItem(
            "currentUser"
        );

        window.location.href =
            "login.html";

    }

}


// ==========================================
// LOAD PROFILE
// ==========================================

function loadStudentProfile() {

    const savedUser =
        localStorage.getItem(
            "currentUser"
        );


    if (!savedUser) {
        return;
    }


    try {

        const user =
            JSON.parse(savedUser);


        // Student name
        const nameElements =
            document.querySelectorAll(
                "[data-student-name]"
            );


        nameElements.forEach(
            element => {

                element.textContent =
                    user.name ||
                    "APEC Student";

            }
        );


        // Student ID
        const idElements =
            document.querySelectorAll(
                "[data-student-id]"
            );


        idElements.forEach(
            element => {

                element.textContent =
                    user.studentId ||
                    "Student";

            }
        );


        // Department
        const departmentElements =
            document.querySelectorAll(
                "[data-student-department]"
            );


        departmentElements.forEach(
            element => {

                element.textContent =
                    user.department ||
                    "Information Technology";

            }
        );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

    }

}


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadStudentDashboard() {

    const savedUser =
        localStorage.getItem(
            "currentUser"
        );


    if (!savedUser) {
        return;
    }


    let currentUser;


    try {

        currentUser =
            JSON.parse(savedUser);

    } catch (error) {

        return;

    }


    const studentId =
        currentUser.studentId;


    if (!studentId) {

        console.warn(
            "Student ID not found."
        );

        return;

    }


    try {

        const complaintsRef =
            collection(
                db,
                "complaints"
            );


        const complaintsQuery =
            query(
                complaintsRef,
                where(
                    "studentId",
                    "==",
                    studentId
                )
            );


        const snapshot =
            await getDocs(
                complaintsQuery
            );


        const complaints = [];


        snapshot.forEach(
            document => {

                complaints.push({

                    id:
                        document.id,

                    ...document.data()

                });

            }
        );


        // Sort latest first
        complaints.sort(
            (a, b) =>
                getTime(
                    b.createdAt
                ) -
                getTime(
                    a.createdAt
                )
        );


        updateStatistics(
            complaints
        );


        updateRecentComplaints(
            complaints
        );


        updateCampusIntelligence(
            complaints
        );


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

        showDashboardMessage(
            "Unable to load your complaints."
        );

    }

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics(
    complaints
) {

    const total =
        complaints.length;


    const inProgress =
        complaints.filter(
            complaint =>
                complaint.status ===
                    "Submitted" ||
                complaint.status ===
                    "Under Review" ||
                complaint.status ===
                    "Assigned" ||
                complaint.status ===
                    "In Progress"
        ).length;


    const resolved =
        complaints.filter(
            complaint =>
                complaint.status ===
                    "Resolved" ||
                complaint.status ===
                    "Closed"
        ).length;


    // Existing stat cards
    const statCards =
        document.querySelectorAll(
            ".stat-card"
        );


    if (
        statCards.length >= 3
    ) {

        const totalNumber =
            statCards[0]
                .querySelector("h3");


        const progressNumber =
            statCards[1]
                .querySelector("h3");


        const resolvedNumber =
            statCards[2]
                .querySelector("h3");


        if (totalNumber) {

            totalNumber.textContent =
                String(total)
                    .padStart(
                        2,
                        "0"
                    );

        }


        if (progressNumber) {

            progressNumber.textContent =
                String(inProgress)
                    .padStart(
                        2,
                        "0"
                    );

        }


        if (resolvedNumber) {

            resolvedNumber.textContent =
                String(resolved)
                    .padStart(
                        2,
                        "0"
                    );

        }

    }


    // Average response
    calculateAverageResponse(
        complaints
    );

}


// ==========================================
// AVERAGE RESPONSE
// ==========================================

function calculateAverageResponse(
    complaints
) {

    const responseValues = [];


    complaints.forEach(
        complaint => {

            if (
                !complaint.createdAt ||
                !complaint.updatedAt
            ) {

                return;

            }


            const created =
                getTime(
                    complaint.createdAt
                );


            const updated =
                getTime(
                    complaint.updatedAt
                );


            if (
                updated > created
            ) {

                const hours =
                    (
                        updated -
                        created
                    ) /
                    (
                        1000 *
                        60 *
                        60
                    );


                responseValues.push(
                    hours
                );

            }

        }
    );


    const average =
        responseValues.length
            ? responseValues.reduce(
                (
                    sum,
                    value
                ) =>
                    sum + value,
                0
            ) /
            responseValues.length
            : 0;


    const averageText =
        average > 0
            ? `${Math.round(
                average
            )}h`
            : "—";


    // Search for average response card
    const statCards =
        document.querySelectorAll(
            ".stat-card"
        );


    if (
        statCards.length >= 4
    ) {

        const averageElement =
            statCards[3]
                .querySelector("h3");


        if (averageElement) {

            averageElement.textContent =
                averageText;

        }

    }

}


// ==========================================
// RECENT COMPLAINTS
// ==========================================

function updateRecentComplaints(
    complaints
) {

    const container =
        document.querySelector(
            ".recent-complaints"
        );


    if (!container) {
        return;
    }


    if (
        complaints.length ===
        0
    ) {

        container.innerHTML = `

            <div
                style="
                    padding:28px;
                    text-align:center;
                    color:#7b8782;
                "
            >

                <div
                    style="
                        font-size:30px;
                        margin-bottom:8px;
                    "
                >
                    ✓
                </div>

                <strong>
                    No complaints yet
                </strong>

                <p
                    style="
                        margin-top:5px;
                        font-size:11px;
                    "
                >
                    Your submitted complaints
                    will appear here.
                </p>

            </div>

        `;

        return;

    }


    const recent =
        complaints.slice(
            0,
            4
        );


    container.innerHTML =
        recent
            .map(
                complaint =>
                    createComplaintRow(
                        complaint
                    )
            )
            .join("");


    // Add click behaviour
    container
        .querySelectorAll(
            "[data-complaint-id]"
        )
        .forEach(
            row => {

                row.addEventListener(
                    "click",
                    () => {

                        const id =
                            row.dataset
                                .complaintId;


                        window.location.href =
                            `track.html?id=${encodeURIComponent(
                                id
                            )}`;

                    }
                );

            }
        );

}


// ==========================================
// COMPLAINT ROW
// ==========================================

function createComplaintRow(
    complaint
) {

    const status =
        complaint.status ||
        "Submitted";


    const priority =
        complaint.priority ||
        "Normal";


    return `

        <div
            class="complaint-row"
            data-complaint-id="${
                escapeHTML(
                    complaint.complaintId ||
                    ""
                )
            }"
            style="cursor:pointer;"
        >

            <div>

                <strong>
                    ${
                        escapeHTML(
                            complaint.title ||
                            "Untitled Complaint"
                        )
                    }
                </strong>

                <small>
                    ${
                        escapeHTML(
                            complaint.complaintId ||
                            ""
                        )
                    }
                </small>

            </div>


            <div
                style="
                    display:flex;
                    align-items:center;
                    gap:7px;
                "
            >

                <span
                    class="status-badge"
                >
                    ${
                        escapeHTML(
                            status
                        )
                    }
                </span>


                <span
                    style="
                        font-size:9px;
                        font-weight:800;
                        text-transform:uppercase;
                        opacity:.65;
                    "
                >
                    ${
                        escapeHTML(
                            priority
                        )
                    }
                </span>

            </div>

        </div>

    `;

}


// ==========================================
// CAMPUS INTELLIGENCE
// ==========================================

function updateCampusIntelligence(
    complaints
) {

    const intelligenceCard =
        document.querySelector(
            ".campus-intelligence"
        );


    if (!intelligenceCard) {
        return;
    }


    // Count categories
    const categoryCount = {};


    complaints.forEach(
        complaint => {

            const category =
                complaint.category ||
                "Other";


            categoryCount[
                category
            ] =
                (
                    categoryCount[
                        category
                    ] ||
                    0
                ) + 1;

        }
    );


    const sorted =
        Object.entries(
            categoryCount
        )
        .sort(
            (
                a,
                b
            ) =>
                b[1] -
                a[1]
        );


    const intelligenceItems =
        intelligenceCard.querySelectorAll(
            ".issue-item"
        );


    if (
        intelligenceItems.length ===
        0
    ) {

        return;

    }


    intelligenceItems.forEach(
        (
            item,
            index
        ) => {

            const issue =
                sorted[index];


            if (!issue) {

                item.style.display =
                    "none";

                return;

            }


            item.style.display =
                "flex";


            const category =
                issue[0];


            const count =
                issue[1];


            const title =
                item.querySelector(
                    "strong"
                );


            const description =
                item.querySelector(
                    "p"
                );


            if (title) {

                title.textContent =
                    category;

            }


            if (description) {

                description.textContent =
                    count === 1
                        ? "1 complaint reported"
                        : `${count} complaints reported`;

            }

        }
    );

}


// ==========================================
// QUICK ACTIONS
// ==========================================

function setupQuickActions() {

    const actionButtons =
        document.querySelectorAll(
            "[data-action]"
        );


    actionButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset
                            .action;


                    if (
                        action ===
                        "submit"
                    ) {

                        window.location.href =
                            "complaint.html";

                    }


                    else if (
                        action ===
                        "track"
                    ) {

                        window.location.href =
                            "track.html";

                    }


                    else if (
                        action ===
                        "confidential"
                    ) {

                        window.location.href =
                            "complaint.html?confidential=true";

                    }


                    else if (
                        action ===
                        "feedback"
                    ) {

                        window.location.href =
                            "track.html";

                    }

                }
            );

        }
    );

}


// ==========================================
// FIREBASE TIMESTAMP
// ==========================================

function getTime(
    value
) {

    if (!value) {
        return 0;
    }


    if (
        value.seconds !==
        undefined
    ) {

        return (
            value.seconds *
            1000
        );

    }


    if (
        typeof value.toDate ===
        "function"
    ) {

        return value
            .toDate()
            .getTime();

    }


    const date =
        new Date(value);


    return Number.isNaN(
        date.getTime()
    )
        ? 0
        : date.getTime();

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
) {

    return String(
        value || ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


// ==========================================
// ERROR MESSAGE
// ==========================================

function showDashboardMessage(
    message
) {

    console.warn(
        message
    );

}