-ClubDesk Authentication Module
This repository contains the authentication feature of ClubDesk, a college club management platform designed to streamline the management of student and club head accounts with role-based access.

-Project Overview
ClubDesk aims to provide a seamless platform for students and club heads to interact, manage memberships, and organize events efficiently. This authentication module is a critical part of the system, allowing secure user registration and login, with differentiation based on user roles.

The two primary user roles supported are:

Student: Regular users who join clubs and participate in events.
Club Head: Club administrators who manage club details and oversee club activities.

-Features
Role-Based Authentication
Uses Firebase Authentication for secure sign-up and login.

Supports role differentiation: students and club heads have distinct data stored in Firestore and different dashboards after login.

-Registration
Students register with basic information (name, email, password).
Club heads provide additional club details (club name, establishment year, domain, motto, description, contact info, social media links, logo URL).

User data is stored in Firestore in separate collections (users for students, clubs for club heads).

-Login & Routing
Login validates credentials via Firebase.

After login, users are redirected to the appropriate dashboard based on their role.

Error handling for failed login attempts.

Loading states during asynchronous operations.

State Management & Context
Uses React Context API to manage authentication state globally.

Automatically listens to Firebase auth state changes to persist user sessions.

Fetches user role and profile data from Firestore on login.

Code Structure
contexts/AuthContext.tsx
Handles authentication logic, registration, login, logout, user state, and Firestore integration.

pages/LoginPage.tsx
Login UI built with React, Framer Motion for animation, and Lucide icons. Handles form inputs, toggles role UI (student/club head), calls login logic, and redirects users based on roles.

firebase.ts (not included here)
Firebase SDK initialization and configuration (you will need to set this up with your own Firebase project).

Getting Started
Prerequisites
Node.js and npm/yarn installed on your machine.

A Firebase project set up with Authentication and Firestore enabled.

How to Use
Navigate to the login page.

Select your role (student or club head).

Enter your email and password.

On successful login, you will be redirected to the role-specific dashboard (e.g., /student/dashboard or /club-head/dashboard).

Contributing
Feel free to fork the project, create branches, and submit pull requests with improvements or bug fixes!
