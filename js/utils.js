// ==========================================
// APEC STUDENT COMPLAINT PORTAL
// Common Utility Functions
// ==========================================


// ---------- Generate Complaint ID ----------

function generateComplaintId() {
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    return `APEC-${year}-${randomNumber}`;
}


// ---------- Format Date ----------

function formatDate(dateValue) {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// ---------- Format Date + Time ----------

function formatDateTime(dateValue) {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// ---------- Calculate Priority ----------

function calculatePriority(category, description) {

    const text = `${category} ${description}`.toLowerCase();

    let score = 20;

    // Critical keywords
    const criticalWords = [
        "danger",
        "dangerous",
        "fire",
        "electric shock",
        "shock",
        "accident",
        "emergency",
        "unsafe",
        "injury",
        "broken wire",
        "short circuit"
    ];

    // High priority keywords
    const highWords = [
        "urgent",
        "immediately",
        "no water",
        "water leakage",
        "leak",
        "not working",
        "broken",
        "no internet",
        "no wifi",
        "issue",
        "problem"
    ];


    // Critical keyword score
    criticalWords.forEach(word => {
        if (text.includes(word)) {
            score += 40;
        }
    });


    // High priority keyword score
    highWords.forEach(word => {
        if (text.includes(word)) {
            score += 25;
        }
    });


    // Safety-related categories
    if (
        category === "Water & Sanitation" ||
        category === "Transportation"
    ) {
        score += 10;
    }


    // Limit score
    score = Math.min(score, 100);


    // Priority label
    let priority = "Normal";

    if (score >= 70) {
        priority = "Critical";
    } else if (score >= 45) {
        priority = "High";
    }


    return {
        score: score,
        priority: priority
    };
}


// ---------- Auto Department Routing ----------

function getDepartment(category) {

    const departmentMap = {

        "Classroom & Infrastructure":
            "Maintenance Department",

        "Laboratory & Computers":
            "IT Support",

        "Wi-Fi & Internet":
            "IT Support",

        "Furniture":
            "Maintenance Department",

        "Water & Sanitation":
            "Maintenance Department",

        "Transportation":
            "Transport Department",

        "Hostel":
            "Hostel Administration",

        "Library":
            "Library Administration",

        "Examination":
            "Examination Cell",

        "Academic/Faculty":
            "Academic Office",

        "Sports":
            "Sports Department",

        "Canteen":
            "Canteen Management",

        "Other":
            "General Administration"
    };

    return departmentMap[category] || "General Administration";
}


// ---------- Status Color Class ----------

function getStatusClass(status) {

    switch (status) {

        case "Submitted":
            return "status-submitted";

        case "Under Review":
            return "status-review";

        case "Assigned":
            return "status-assigned";

        case "In Progress":
            return "status-progress";

        case "Resolved":
            return "status-resolved";

        case "Closed":
            return "status-closed";

        default:
            return "";
    }
}


// ---------- Priority Class ----------

function getPriorityClass(priority) {

    switch (priority) {

        case "Critical":
            return "priority-critical";

        case "High":
            return "priority-high";

        case "Normal":
            return "priority-normal";

        default:
            return "";
    }
}


// ---------- Toast Notification ----------

function showToast(message, type = "success") {

    const toast = document.createElement("div");

    toast.className = `apec-toast ${type}`;

    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

    document.body.appendChild(toast);


    setTimeout(() => {

        if (toast) {
            toast.remove();
        }

    }, 3500);
}


// ---------- Save Temporary Data ----------

function saveLocalData(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );
}


// ---------- Get Temporary Data ----------

function getLocalData(key) {

    const data = localStorage.getItem(key);

    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
}


// ---------- Escape HTML ----------
// Prevents unsafe HTML from being inserted into pages.

function escapeHtml(value) {

    if (!value) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ---------- Export Functions ----------

export {
    generateComplaintId,
    formatDate,
    formatDateTime,
    calculatePriority,
    getDepartment,
    getStatusClass,
    getPriorityClass,
    showToast,
    saveLocalData,
    getLocalData,
    escapeHtml
};