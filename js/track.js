// ==========================================
// APEC STUDENT COMPLAINT PORTAL
// COMPLAINT TRACKING ENGINE
// ==========================================

import { db } from "./firebase-config.js";

import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ==========================================
// STATUS FLOW
// ==========================================

const STATUSES = [
    "Submitted",
    "Under Review",
    "Assigned",
    "In Progress",
    "Resolved",
    "Closed"
];


// ==========================================
// CURRENT COMPLAINT
// ==========================================

let currentComplaint = null;

let selectedRating = 0;


// ==========================================
// ELEMENTS
// ==========================================

const searchInput =
    document.getElementById(
        "complaintSearch"
    );


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const complaintId =
            params.get("id");


        if (
            complaintId &&
            searchInput
        ) {

            searchInput.value =
                complaintId;

            loadComplaint(
                complaintId
            );

        }


        setupSearch();

        setupFeedback();

    }
);


// ==========================================
// SEARCH SETUP
// ==========================================

function setupSearch() {

    const searchButton =
        document.querySelector(
            ".search-box button"
        );


    if (!searchButton) {
        return;
    }


    searchButton.addEventListener(
        "click",
        () => {

            const id =
                searchInput
                    ?.value
                    .trim();


            if (!id) {

                showMessage(
                    "Please enter a Complaint ID.",
                    "error"
                );

                return;
            }


            loadComplaint(id);

        }
    );


    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    searchButton.click();

                }

            }
        );

    }

}


// ==========================================
// LOAD COMPLAINT
// ==========================================

async function loadComplaint(
    complaintId
) {

    try {

        showMessage(
            "Loading complaint...",
            "info"
        );


        const complaintsRef =
            collection(
                db,
                "complaints"
            );


        const complaintQuery =
            query(
                complaintsRef,
                where(
                    "complaintId",
                    "==",
                    complaintId
                )
            );


        const snapshot =
            await getDocs(
                complaintQuery
            );


        if (snapshot.empty) {

            showMessage(
                "Complaint not found. Please check the Complaint ID.",
                "error"
            );

            return;
        }


        const document =
            snapshot.docs[0];


        currentComplaint = {

            documentId:
                document.id,

            ...document.data()

        };


        displayComplaint(
            currentComplaint
        );


        loadComplaintHistory(
            currentComplaint.complaintId
        );


        calculateSLA(
            currentComplaint
        );


    } catch (error) {

        console.error(
            "Tracking error:",
            error
        );


        showMessage(
            "Unable to load complaint. Please try again.",
            "error"
        );

    }

}


// ==========================================
// DISPLAY COMPLAINT
// ==========================================

function displayComplaint(
    data
) {

    const titleElement =
        document.querySelector(
            ".complaint-overview h2"
        );


    const categoryElement =
        document.querySelector(
            ".overview-category"
        );


    const departmentElement =
        document.querySelector(
            ".overview-department"
        );


    const statusElement =
        document.querySelector(
            ".overview-status"
        );


    const priorityElement =
        document.querySelector(
            ".overview-priority"
        );


    const dateElement =
        document.querySelector(
            ".overview-date"
        );


    if (titleElement) {

        titleElement.textContent =
            data.title ||
            "Complaint";

    }


    if (categoryElement) {

        categoryElement.textContent =
            data.category ||
            "-";

    }


    if (departmentElement) {

        departmentElement.textContent =
            data.assignedDepartment ||
            "Not Assigned";

    }


    if (statusElement) {

        statusElement.textContent =
            data.status ||
            "Submitted";

    }


    if (priorityElement) {

        priorityElement.textContent =
            data.priority ||
            "Normal";

    }


    if (
        priorityElement &&
        data.priority ===
            "Critical"
    ) {

        priorityElement.style.color =
            "#b42318";

    }

    else if (
        priorityElement &&
        data.priority ===
            "High"
    ) {

        priorityElement.style.color =
            "#92701f";

    }


    if (
        dateElement &&
        data.createdAt
    ) {

        const date =
            convertFirebaseDate(
                data.createdAt
            );


        if (date) {

            dateElement.textContent =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        day:
                            "2-digit",

                        month:
                            "short",

                        year:
                            "numeric"
                    }
                );

        }

    }


    updateTimeline(
        data.status
    );


    displayResolution(
        data
    );

}


// ==========================================
// TIMELINE
// ==========================================

function updateTimeline(
    currentStatus
) {

    const currentIndex =
        STATUSES.indexOf(
            currentStatus
        );


    const timelineItems =
        document.querySelectorAll(
            ".timeline-item"
        );


    timelineItems.forEach(
        (item, index) => {

            item.classList.remove(
                "completed"
            );

            item.classList.remove(
                "active"
            );


            if (
                currentIndex >= 0 &&
                index < currentIndex
            ) {

                item.classList.add(
                    "completed"
                );

            }


            if (
                index ===
                currentIndex
            ) {

                item.classList.add(
                    "active"
                );

            }

        }
    );

}


// ==========================================
// LOAD STATUS HISTORY
// ==========================================

async function loadComplaintHistory(
    complaintId
) {

    try {

        const updatesRef =
            collection(
                db,
                "complaint_updates"
            );


        const historyQuery =
            query(
                updatesRef,
                where(
                    "complaintId",
                    "==",
                    complaintId
                )
            );


        const snapshot =
            await getDocs(
                historyQuery
            );


        if (
            snapshot.empty
        ) {

            return;
        }


        const updates = [];


        snapshot.forEach(
            item => {

                updates.push({
                    id:
                        item.id,

                    ...item.data()
                });

            }
        );


        updates.sort(
            (a, b) =>
                getTimestamp(
                    a.timestamp
                ) -
                getTimestamp(
                    b.timestamp
                )
        );


        displayHistory(
            updates
        );


    } catch (error) {

        console.error(
            "History error:",
            error
        );

    }

}


// ==========================================
// DISPLAY HISTORY
// ==========================================

function displayHistory(
    updates
) {

    const timeline =
        document.querySelector(
            ".timeline"
        );


    if (!timeline) {
        return;
    }


    updates.forEach(
        update => {

            const existing =
                Array.from(
                    timeline.querySelectorAll(
                        ".timeline-content strong"
                    )
                ).some(
                    element =>
                        element.textContent.trim() ===
                        update.status
                );


            if (existing) {
                return;
            }

        }
    );

}


// ==========================================
// RESOLUTION DETAILS
// ==========================================

function displayResolution(
    data
) {

    let existingBox =
        document.getElementById(
            "resolutionDetails"
        );


    if (
        !data.resolutionRemarks
    ) {

        if (existingBox) {

            existingBox.remove();

        }

        return;
    }


    if (!existingBox) {

        existingBox =
            document.createElement(
                "div"
            );

        existingBox.id =
            "resolutionDetails";

        existingBox.style.marginTop =
            "18px";

        existingBox.style.padding =
            "15px";

        existingBox.style.borderRadius =
            "12px";

        existingBox.style.background =
            "#f2faf6";

        existingBox.style.border =
            "1px solid #d7eadf";


        const feedbackCard =
            document.querySelector(
                ".feedback-card"
            );


        if (feedbackCard) {

            feedbackCard.parentNode.insertBefore(
                existingBox,
                feedbackCard
            );

        }

    }


    existingBox.innerHTML = `

        <strong
            style="
                display:block;
                font-size:12px;
                margin-bottom:5px;
            "
        >
            ✓ Resolution Remarks
        </strong>

        <p
            style="
                margin:0;
                color:#65736d;
                font-size:11px;
                line-height:1.6;
            "
        >
            ${escapeHTML(
                data.resolutionRemarks
            )}
        </p>

    `;

}


// ==========================================
// SLA CALCULATION
// ==========================================

function calculateSLA(
    data
) {

    const progress =
        document.querySelector(
            ".progress-fill"
        );


    const timeLabel =
        document.querySelector(
            ".sla-time"
        );


    const details =
        document.querySelector(
            ".sla-details"
        );


    if (!data.createdAt) {
        return;
    }


    const createdDate =
        convertFirebaseDate(
            data.createdAt
        );


    if (!createdDate) {
        return;
    }


    const now =
        new Date();


    const totalHours =
        48;


    const elapsedMilliseconds =
        now.getTime() -
        createdDate.getTime();


    const elapsedHours =
        elapsedMilliseconds /
        (1000 * 60 * 60);


    const percentage =
        Math.min(
            100,
            Math.max(
                0,
                (
                    elapsedHours /
                    totalHours
                ) * 100
            )
        );


    const remainingHours =
        Math.max(
            0,
            totalHours -
            elapsedHours
        );


    if (progress) {

        progress.style.width =
            `${percentage}%`;

    }


    if (timeLabel) {

        const roundedElapsed =
            Math.min(
                totalHours,
                Math.max(
                    0,
                    Math.round(
                        elapsedHours
                    )
                )
            );


        timeLabel.textContent =
            `${roundedElapsed}h / 48h`;

    }


    if (details) {

        const spans =
            details.querySelectorAll(
                "span"
            );


        if (spans.length >= 2) {

            spans[0].textContent =
                `${Math.round(
                    percentage
                )}% elapsed`;


            spans[1].textContent =
                remainingHours > 0
                    ? `${Math.ceil(
                        remainingHours
                    )}h remaining`
                    : "SLA exceeded";

        }

    }


    // ======================================
    // ESCALATION WARNING
    // ======================================

    updateEscalation(
        elapsedHours,
        data.status
    );

}


// ==========================================
// ESCALATION
// ==========================================

function updateEscalation(
    elapsedHours,
    status
) {

    const escalationBox =
        document.querySelector(
            ".escalation-box"
        );


    if (!escalationBox) {
        return;
    }


    const resolved =
        status === "Resolved" ||
        status === "Closed";


    if (
        elapsedHours >= 48 &&
        !resolved
    ) {

        escalationBox.style.background =
            "#fff1f1";

        escalationBox.style.borderColor =
            "#f0caca";


        escalationBox.innerHTML = `

            <strong
                style="color:#b42318;"
            >
                ⚠ SLA Escalation Required
            </strong>

            <p>
                This complaint has crossed
                the 48-hour resolution target
                and requires administrative
                attention.
            </p>

        `;

        return;
    }


    if (
        elapsedHours >= 36 &&
        !resolved
    ) {

        escalationBox.style.background =
            "#fffaf0";

        escalationBox.style.borderColor =
            "#eee1bd";


        escalationBox.innerHTML = `

            <strong>
                ⚠ SLA Warning
            </strong>

            <p>
                This complaint is approaching
                its 48-hour resolution limit.
            </p>

        `;

        return;
    }


    escalationBox.style.background =
        "#fffaf0";

    escalationBox.style.borderColor =
        "#eee1bd";

}


// ==========================================
// FEEDBACK
// ==========================================

function setupFeedback() {

    const stars =
        document.querySelectorAll(
            ".star"
        );


    const feedbackInput =
        document.querySelector(
            ".feedback-box textarea"
        );


    const submitButton =
        document.querySelector(
            ".feedback-box button"
        );


    stars.forEach(
        (star, index) => {

            star.addEventListener(
                "click",
                () => {

                    selectedRating =
                        index + 1;


                    stars.forEach(
                        (
                            item,
                            itemIndex
                        ) => {

                            item.classList.toggle(
                                "selected",
                                itemIndex <
                                    selectedRating
                            );

                        }
                    );

                }
            );

        }
    );


    if (!submitButton) {
        return;
    }


    submitButton.addEventListener(
        "click",
        async () => {

            if (!currentComplaint) {

                showMessage(
                    "Search for a complaint first.",
                    "error"
                );

                return;
            }


            if (selectedRating === 0) {

                showMessage(
                    "Please select a rating.",
                    "error"
                );

                return;
            }


            if (
                currentComplaint.status !==
                    "Resolved" &&
                currentComplaint.status !==
                    "Closed"
            ) {

                showMessage(
                    "Feedback can be submitted after the complaint is resolved.",
                    "error"
                );

                return;
            }


            const comment =
                feedbackInput
                    ?.value
                    .trim() || "";


            try {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Submitting...";


                await addDoc(
                    collection(
                        db,
                        "feedback"
                    ),
                    {

                        complaintId:
                            currentComplaint
                                .complaintId,

                        studentId:
                            currentComplaint
                                .studentId ||
                            "",

                        rating:
                            selectedRating,

                        comment,

                        verified:
                            false,

                        createdAt:
                            serverTimestamp()

                    }
                );


                showMessage(
                    "Thank you! Your feedback has been submitted.",
                    "success"
                );


                if (feedbackInput) {

                    feedbackInput.value =
                        "";

                }


            } catch (error) {

                console.error(
                    "Feedback error:",
                    error
                );


                showMessage(
                    "Unable to submit feedback.",
                    "error"
                );


            } finally {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Feedback";

            }

        }
    );

}


// ==========================================
// FIREBASE DATE
// ==========================================

function convertFirebaseDate(
    value
) {

    if (!value) {
        return null;
    }


    if (
        typeof value.toDate ===
        "function"
    ) {

        return value.toDate();

    }


    if (
        value.seconds !==
        undefined
    ) {

        return new Date(
            value.seconds * 1000
        );

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


// ==========================================
// TIMESTAMP VALUE
// ==========================================

function getTimestamp(
    value
) {

    if (!value) {
        return 0;
    }


    if (
        value.seconds !==
        undefined
    ) {

        return value.seconds;

    }


    const date =
        convertFirebaseDate(
            value
        );


    return date
        ? date.getTime()
        : 0;

}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    message,
    type = "info"
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