# Distributor Financing Platform

A modern web-based application that streamlines distributor financing by connecting manufacturers, distributors, banks, and platform administrators through a centralized digital platform.

The system provides secure authentication, role-based access control, financing workflows, distributor onboarding, approvals, portfolio management, analytics, and reporting through an intuitive and responsive user interface.

---

## Project Overview

The Distributor Financing Platform is designed to digitize financing processes between manufacturers, distributors, and financial institutions.

The application replaces manual processes with a centralized platform that enables stakeholders to:

- Manage distributor onboarding
- Approve financing requests
- Monitor financing portfolios
- Track business performance
- Generate reports
- Improve collaboration between stakeholders

The frontend communicates with backend REST APIs to provide a seamless user experience across different user roles.

---

# Features

## Authentication

- Secure Login
- Forgot Password
- Reset Password
- Change Password
- Role-Based Access Control (RBAC)

---

## Platform Administration

- Dashboard
- Manage Bank Administrators
- Manage Manufacturers
- View Registered Distributors
- Approve Distributor Registrations
- Platform Analytics

---

## Bank Module

- Dashboard
- Customer Management
- Distributor Approval Workflow
- Portfolio Monitoring
- Reports

---

## Manufacturer Module

- Dashboard
- Distributor Management
- Financing Requests
- Product Performance Analytics
- Business Insights

---

## Distributor Module

- Dashboard
- Financing Applications
- Loan Tracking
- Account Management

---

# Technology Stack

| Technology | Purpose |
|------------|---------|
| Next.js | Frontend Framework |
| React | UI Library |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Axios | API Communication |
| React Hook Form | Form Handling |
| Lucide React | Icons |

---

# Project Structure

```
src/
│
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   └── api/
│
├── components/
│
├── hooks/
│
├── lib/
│
├── services/
│
├── styles/
│
└── types/
```

---

# Installation

Clone the repository

```bash
git clone https://github.com/EMTECH-PLP/distributor_financing_frontend.git
```

Navigate into the project

```bash
cd distributor_financing_frontend
```

Install dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env.local` file in the project root.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Replace the API URL with the appropriate backend endpoint for your environment.

---

# Running the Application

Start the development server

```bash
npm run dev
```

The application will be available at

```
http://localhost:3000
```

---

# Available Scripts

Run the development server

```bash
npm run dev
```

Build the application

```bash
npm run build
```

Run the production build

```bash
npm start
```

Run linting

```bash
npm run lint
```

---

# API Integration

The frontend integrates with REST APIs for:

- Authentication
- User Management
- Distributor Approval
- Manufacturer Operations
- Bank Operations
- Dashboard Analytics
- Reports

Additional modules will be integrated as backend services become available.

---

# Current Status

## Completed

- User Authentication
- Role-Based Routing
- Responsive User Interface
- Manufacturer Dashboard
- Bank Dashboard
- Platform Administrator Dashboard
- Distributor Approval Workflow
- User Management
- Dashboard Analytics
- REST API Integration

## In Progress

- Additional backend integrations
- Reports enhancements
- Notifications
- Advanced analytics

---

# Future Enhancements

- Email Notifications
- Audit Logs
- Real-Time Dashboard Updates
- Export Reports (PDF & Excel)
- Advanced Analytics
- Performance Optimization

---

# Contributors

This project was collaboratively developed as part of the EMTECH Software Engineering Program.

| Contributor | Responsibilities |
|-------------|------------------|
| **Kelvin Moruri** | Frontend Development, Dashboard Implementation, API Integration, Responsive Design, UI/UX Development |
| **Brian Sigei** | Frontend Development, Feature Implementation, Testing, UI Improvements, Project Collaboration |


## Acknowledgements

We would like to express our sincere gratitude to the **EMTECH Development Team** for their guidance and support throughout this project.

A special thank you to **Benson** for his dedication, coaching, mentorship, and encouragement during the development process.

---

# Acknowledgements

We acknowledge the support and guidance provided through the **EMTECH Software Engineering Program**, whose mentorship and project framework contributed to the successful development of this application.

---

# License
    
This project was developed for educational purposes as part of the EMTECH Software Engineering Program.