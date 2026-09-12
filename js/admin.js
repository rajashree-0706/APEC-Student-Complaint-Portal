// ==========================================
// APEC STUDENT COMPLAINT PORTAL
// ADMIN CONSOLE
// ==========================================

import { db } from "./firebase-config.js";

import {
    collection,
    query,
    orderBy,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ==========================================
// GLOBAL DATA
// ==========================================

let allComplaints = [];


// ==========================================
// STATUS OPTIONS
// ==========================================

const VALID_STATUSES = [
    "Submitted",
    "Under Review",
    "Assigned",
    "In Progress",
    "Resolved",
    "Closed"
];


// ==========================================
// DEPARTMENT OPTIONS
// ==========================================

const DEPARTMENTS = [
    "Maintenance Department",
    "IT Support",
    "Transport Department",
    "Hostel Administration",
    "Library Administration",
    "Examination Cell",
    "Academic Office",
    "Sports Department",
    "Canteen Management",
    "General Administration"
];


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAdminComplaints();

        setupFilterButton();

    }
);


// ==========================================
// LOAD COMPLAINTS
// ==========================================

async function loadAdminComplaints() {

    try {

        const complaintsRef =
            collection(
                db,
                "complaints"
            );


        const complaintsQuery =
            query(
                complaintsRef,
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                complaintsQuery
            );


        allComplaints = [];


        snapshot.forEach(
            item => {

                allComplaints.push({

                    id: item.id,

                    ...item.data()

                });

            }
        );


        updateDashboardStats(
            allComplaints
        );


        displayComplaints(
            allComplaints
        );


        updateIntelligence(
            allComplaints
        );


        updateDepartmentAnalytics(
            allComplaints
        );


        updateResolutionPerformance(
            allComplaints
        );


    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );


        showAdminMessage(
            "Unable to load complaints from Firebase.",
            "error"
        );

    }

}


// ==========================================
// DASHBOARD STATS
// ==========================================

function updateDashboardStats(
    complaints
) {

    const total =
        complaints.length;


    const pending =
        complaints.filter(
            complaint =>
                complaint.status !== "Resolved" &&
                complaint.status !== "Closed"
        ).length;


    const critical =
        complaints.filter(
            complaint =>
                complaint.priority === "Critical"
        ).length;


    const resolved =
        complaints.filter(
            complaint =>
                complaint.status === "Resolved" ||
                complaint.status === "Closed"
        ).length;


    const cards =
        document.querySelectorAll(
            ".admin-stat, .stat-card"
        );


    if (cards.length >= 4) {

        const values = [
            total,
            pending,
            critical,
            resolved
        ];


        cards.forEach(
            (card, index) => {

                const heading =
                    card.querySelector("h3");


                if (heading) {

                    heading.textContent =
                        values[index] ?? 0;

                }

            }
        );

    }

}


// ==========================================
// DISPLAY COMPLAINTS
// ==========================================

function displayComplaints(
    complaints
) {

    const tableBody =
        document.querySelector("tbody");


    if (!tableBody) {
        return;
    }


    if (complaints.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:35px;
                        color:#7b8983;
                    "
                >

                    No complaints found.

                </td>

            </tr>

        `;

        return;
    }


    tableBody.innerHTML =
        complaints
            .map(
                (complaint, index) => {

                    const priority =
                        complaint.priority ||
                        "Normal";


                    const status =
                        complaint.status ||
                        "Submitted";


                    const department =
                        complaint.assignedDepartment ||
                        "Not Assigned";


                    return `

                        <tr>

                            <td>

                                <strong>
                                    ${escapeHTML(
                                        complaint.complaintId ||
                                        `#${index + 1}`
                                    )}
                                </strong>

                            </td>


                            <td>

                                ${escapeHTML(
                                    complaint.title ||
                                    "Untitled Complaint"
                                )}

                            </td>


                            <td>

                                ${escapeHTML(
                                    complaint.category ||
                                    "-"
                                )}

                            </td>


                            <td>

                                <span class="priority-badge">

                                    ${escapeHTML(
                                        priority
                                    )}

                                </span>

                            </td>


                            <td>

                                <span class="status-badge">

                                    ${escapeHTML(
                                        status
                                    )}

                                </span>

                            </td>


                            <td>

                                ${escapeHTML(
                                    department
                                )}

                            </td>


                            <td>

                                <button
                                    class="manage-btn"
                                    data-id="${complaint.id}"
                                >
                                    Manage
                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    // ======================================
    // MANAGE BUTTONS
    // ======================================

    document
        .querySelectorAll(
            ".manage-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        manageComplaint(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


// ==========================================
// MANAGE COMPLAINT
// ==========================================

async function manageComplaint(
    documentId
) {

    const complaint =
        allComplaints.find(
            item =>
                item.id === documentId
        );


    if (!complaint) {
        return;
    }


    // ======================================
    // STATUS
    // ======================================

    const newStatus =
        prompt(

            `Complaint: ${complaint.complaintId}\n\n` +

            `Current Status: ${complaint.status || "Submitted"}\n\n` +

            `Enter new status:\n\n` +

            VALID_STATUSES.join("\n")

        );


    if (!newStatus) {
        return;
    }


    if (
        !VALID_STATUSES.includes(
            newStatus.trim()
        )
    ) {

        showAdminMessage(
            "Invalid status selected.",
            "error"
        );

        return;
    }


    // ======================================
    // DEPARTMENT
    // ======================================

    const department =
        prompt(

            `Assign Department\n\n` +

            `Current: ${
                complaint.assignedDepartment ||
                "Not Assigned"
            }\n\n` +

            `Available departments:\n\n` +

            DEPARTMENTS.join("\n")

        );


    if (!department) {
        return;
    }


    if (
        !DEPARTMENTS.includes(
            department.trim()
        )
    ) {

        showAdminMessage(
            "Invalid department.",
            "error"
        );

        return;
    }


    // ======================================
    // RESOLUTION REMARK
    // ======================================

    let resolutionRemarks = "";


    if (
        newStatus.trim() === "Resolved" ||
        newStatus.trim() === "Closed"
    ) {

        resolutionRemarks =
            prompt(
                "Enter resolution remarks:"
            ) || "";

    }


    await updateComplaint(
        documentId,
        newStatus.trim(),
        department.trim(),
        resolutionRemarks
    );

}


// ==========================================
// UPDATE COMPLAINT
// ==========================================

async function updateComplaint(
    documentId,
    newStatus,
    department,
    resolutionRemarks
) {

    try {

        // ==================================
        // UPDATE MAIN COMPLAINT
        // ==================================

        const complaintRef =
            doc(
                db,
                "complaints",
                documentId
            );


        await updateDoc(
            complaintRef,
            {

                status:
                    newStatus,

                assignedDepartment:
                    department,

                resolutionRemarks:
                    resolutionRemarks,

                updatedAt:
                    serverTimestamp()

            }
        );


        // ==================================
        // CREATE STATUS HISTORY
        // ==================================

        const complaint =
            allComplaints.find(
                item =>
                    item.id === documentId
            );


        if (complaint) {

            await addDoc(
                collection(
                    db,
                    "complaint_updates"
                ),
                {

                    complaintId:
                        complaint.complaintId,

                    documentId,

                    status:
                        newStatus,

                    message:
                        resolutionRemarks ||
                        `Complaint moved to ${newStatus}.`,

                    updatedBy:
                        "APEC Administrator",

                    timestamp:
                        serverTimestamp()

                }
            );

        }


        showAdminMessage(
            `Complaint updated to "${newStatus}".`,
            "success"
        );


        // Reload live data
        await loadAdminComplaints();


    } catch (error) {

        console.error(
            "Complaint update error:",
            error
        );


        showAdminMessage(
            "Unable to update complaint.",
            "error"
        );

    }

}


// ==========================================
// FILTER BUTTON
// ==========================================

function setupFilterButton() {

    const button =
        document.getElementById(
            "applyFilterBtn"
        );


    if (button) {

        button.addEventListener(
            "click",
            applyFilters
        );

    }

}


// ==========================================
// APPLY FILTERS
// ==========================================

function applyFilters() {

    const search =
        document
            .getElementById(
                "searchComplaint"
            )
            ?.value
            .toLowerCase()
            .trim() || "";


    const category =
        document
            .getElementById(
                "categoryFilter"
            )
            ?.value || "";


    const priority =
        document
            .getElementById(
                "priorityFilter"
            )
            ?.value || "";


    const status =
        document
            .getElementById(
                "statusFilter"
            )
            ?.value || "";


    const filtered =
        allComplaints.filter(
            complaint => {

                const complaintId =
                    (
                        complaint.complaintId ||
                        ""
                    ).toLowerCase();


                const title =
                    (
                        complaint.title ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    complaintId.includes(
                        search
                    ) ||
                    title.includes(
                        search
                    );


                const matchesCategory =
                    !category ||
                    complaint.category ===
                        category;


                const matchesPriority =
                    !priority ||
                    complaint.priority ===
                        priority;


                const matchesStatus =
                    !status ||
                    complaint.status ===
                        status;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesPriority &&
                    matchesStatus
                );

            }
        );


    displayComplaints(
        filtered
    );

}


// ==========================================
// CAMPUS INTELLIGENCE
// ==========================================

function updateIntelligence(
    complaints
) {

    const intelligenceCard =
        document.querySelector(
            ".intelligence-card"
        );


    if (!intelligenceCard) {
        return;
    }


    // Count repeated title/category
    const issueMap = {};


    complaints.forEach(
        complaint => {

            const title =
                (
                    complaint.title ||
                    complaint.category ||
                    "Other"
                )
                .trim()
                .toLowerCase();


            if (!title) {
                return;
            }


            issueMap[title] =
                (
                    issueMap[title] ||
                    0
                ) + 1;

        }
    );


    const repeatedIssues =
        Object.entries(
            issueMap
        )
        .filter(
            ([, count]) =>
                count >= 2
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .slice(0, 3);


    const items =
        intelligenceCard.querySelectorAll(
            ".issue-item"
        );


    if (items.length === 0) {
        return;
    }


    items.forEach(
        (item, index) => {

            const issue =
                repeatedIssues[index];


            const title =
                item.querySelector(
                    ".issue-top strong"
                );


            const count =
                item.querySelector(
                    ".issue-count"
                );


            const bar =
                item.querySelector(
                    ".issue-bar span"
                );


            if (!issue) {

                if (title) {
                    title.textContent =
                        "No emerging issue";
                }

                if (count) {
                    count.textContent =
                        "0 reports";
                }

                if (bar) {
                    bar.style.width =
                        "0%";
                }

                return;
            }


            const issueName =
                issue[0]
                    .split(" ")
                    .map(
                        word =>
                            word.charAt(0)
                                .toUpperCase() +
                            word.slice(1)
                    )
                    .join(" ");


            const issueCount =
                issue[1];


            if (title) {

                title.textContent =
                    issueName;

            }


            if (count) {

                count.textContent =
                    `${issueCount} reports`;

            }


            if (bar) {

                const width =
                    Math.min(
                        100,
                        issueCount * 15
                    );


                bar.style.width =
                    `${width}%`;

            }

        }
    );

}


// ==========================================
// DEPARTMENT ANALYTICS
// ==========================================

function updateDepartmentAnalytics(
    complaints
) {

    const departmentData = {};


    complaints.forEach(
        complaint => {

            const department =
                complaint.assignedDepartment ||
                "Unassigned";


            departmentData[department] =
                (
                    departmentData[department] ||
                    0
                ) + 1;

        }
    );


    const sorted =
        Object.entries(
            departmentData
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .slice(0, 4);


    const rows =
        document.querySelectorAll(
            ".department-row"
        );


    rows.forEach(
        (row, index) => {

            const data =
                sorted[index];


            if (!data) {
                return;
            }


            const label =
                row.querySelector(
                    ".department-info span"
                );


            const count =
                row.querySelector(
                    ".department-info strong"
                );


            const bar =
                row.querySelector(
                    ".department-progress span"
                );


            if (label) {
                label.textContent =
                    data[0];
            }


            if (count) {
                count.textContent =
                    data[1];
            }


            if (bar) {

                const max =
                    sorted[0]?.[1] || 1;


                bar.style.width =
                    `${(
                        data[1] /
                        max *
                        100
                    )}%`;

            }

        }
    );

}


// ==========================================
// RESOLUTION PERFORMANCE
// ==========================================

function updateResolutionPerformance(
    complaints
) {

    const total =
        complaints.length;


    const resolved =
        complaints.filter(
            complaint =>
                complaint.status === "Resolved" ||
                complaint.status === "Closed"
        ).length;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (
                    resolved /
                    total
                ) * 100
            );


    const score =
        document.querySelector(
            ".performance-score"
        );


    if (score) {

        score.textContent =
            `${percentage}%`;

    }

}


// ==========================================
// ADMIN MESSAGE
// ==========================================

function showAdminMessage(
    message,
    type = "success"
) {

    if (
        typeof window.showToast ===
        "function"
    ) {

        window.showToast(
            message,
            type
        );

        return;
    }


    alert(message);

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
// EXPORT
// ==========================================

export {
    applyFilters
};