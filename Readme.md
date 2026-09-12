# APEC Student Complaint & Grievance Management Portal

## 📌 Project Overview

The APEC Student Complaint Portal is a digital grievance management system designed to make complaint submission, tracking and resolution easier for students and administrators.

The system helps students submit complaints and allows administrators to monitor, assign, prioritize and resolve them efficiently.

---

## 🎯 Key Features

### Student Module
- Student registration and login
- Submit complaints
- Select complaint category
- Add detailed description
- Add location details
- Upload supporting evidence
- Confidential complaint option
- Unique Complaint ID
- Track complaint status
- View complaint timeline
- Submit resolution feedback

### Admin Module
- Secure administrator login
- Complaint dashboard
- Total / Pending / Critical / Resolved statistics
- Search and filter complaints
- Priority-based complaint management
- Department-wise routing
- Update complaint status
- Resolution tracking
- Campus Intelligence
- Emerging issue detection
- Complaint analytics

---

## 🧠 Smart Complaint Engine

The portal analyzes complaint information and automatically provides:

### Smart Priority
Complaints are classified as:

- Normal
- High
- Critical

### Auto Department Routing

Complaints are automatically routed according to their category.

Examples:

- Hostel → Hostel Administration
- Laboratory & Computers → IT Support
- Wi-Fi & Internet → IT Support
- Transportation → Transport Department
- Library → Library Administration
- Examination → Examination Cell
- Water & Sanitation → Maintenance Department

---

## 🌐 Campus Intelligence

The system identifies repeated complaint patterns and helps administrators detect emerging campus problems.

Example:

Multiple students report:

> C Block Hostel Water Supply Problem

The system can identify the repeated issue and highlight it as an emerging campus concern.

This helps the administration focus on recurring problems instead of treating every complaint separately.

---

## 🔄 Complaint Status Flow

Submitted  
↓  
Under Review  
↓  
Assigned  
↓  
In Progress  
↓  
Resolved  
↓  
Closed

---

## 🛠 Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend / Database
- Firebase Authentication
- Firebase Firestore
- Firebase Storage

### Hosting
- GitHub Pages

### Analytics
- JavaScript-based dashboard
- Chart.js (optional)

---

## 📁 Project Structure

```text
APEC_Student_Complaint_Portal/
│
├── index.html
├── login.html
├── student.html
├── complaint.html
├── track.html
├── admin.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── firebase-config.js
│   ├── auth.js
│   ├── student.js
│   ├── complaint.js
│   ├── track.js
│   ├── admin.js
│   └── utils.js
│
└── README.md