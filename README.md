# CCIRP Frontend

## Overview

The **CCIRP Frontend** is the user interface of the **Central Communication and Intelligent Reminder Platform (CCIRP)**.
It is built using **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**, providing a modern and responsive interface for managing communication, campaigns, reminders, and analytics.

The frontend interacts with the **FastAPI backend** to handle authentication, notifications, reminders, AI-based suggestions, and campaign management.

---

## Tech Stack

* **Next.js 16** – Cutting-edge React framework with App Router
* **React 19** – Latest UI component library
* **TypeScript** – Type-safe JavaScript
* **Tailwind CSS 4** – Next-generation utility-first CSS engine
* **Lucide React** – Premium icon set
* **Recharts** – High-performance data visualization
* **ESLint 9** – Modern code linting

---

## Project Structure

```
frontend
│
├── app                # Next.js App Router
│   ├── ai             # AI assistant interface
│   ├── analytics      # Campaign analytics dashboard
│   ├── campaigns      # Campaign management
│   ├── dashboard      # Main dashboard
│   ├── login          # Secure authentication entry
│   ├── register       # New user onboarding
│   ├── recipients     # Recipient management
│   ├── settings       # Platform configuration
│   └── templates      # Message template management
│
├── components         # Reusable UI components
├── libs               # Shared utilities and API layer
│   └── api.ts         # Centralized backend communication
├── public             # Static assets
└── ...
```

---

## Features

### Dashboard

* Overview of campaigns and communication statistics
* Key performance metrics displayed through stat cards
* Central navigation hub

### Campaign Strategy Module

* **Multi-Step Progression Pipeline**: A comprehensive 4-stage deployment wizard.
    * *Step 1: Scope & Details:* Establishing campaign taxonomy (Name, Content Subject).
    * *Step 2: Asset Binding:* Engaging UI selection from the retrieved unified Template Library.
    * *Step 3: Audience Definition:* Input metrics capturing designated `recipients` metrics.
    * *Step 4: Launch Review:* Statistical pre-flight checks summarizing payload sizes prior to final dispatch.
* **Persistence Handling**: Fully mapped execution chaining wizard completions seamlessly to `POST /campaigns` logic.

### Premium Dark Mode

* **Platform-Wide Refactor**: Deeply integrated dark theme across all modules (AI Chat, Audience, Settings, Templates, Campaigns).
* **Glassmorphism Design**: High-contrast UI with translucent backgrounds (`bg-card/90`, `backdrop-blur-xl`).
* **Aesthetic Flourishes**: Rich deployment of shimmer loading states and floating slide-up animations.
* **Interactivity Cues**: Consistent `cursor-pointer` feedback and active state animations.

### Immersive Design Workbench

* **Visual Editor**: Drag-and-drop canvas for professional template design.
* **Boundless Canvas**: Infinite dotted grid with **Zoom (Ctrl+Wheel)** and **Pan (Middle Mouse)** controls.
* **Figma-Style Navigation**: Advanced mathematical zoom levels and Spacebar-drag panning capabilities.
* **Layers Tree**: Manage z-index and object hierarchy with a dedicated layers panel.
* **Premium Properties**: Granular control over Typography, Colors, and Layout (Corner Radius, Alignment).
* **High-Fidelity UI**: Seamless app-within-an-app experience with real-time feedback.
* **Version Governance**: Browse historical versions and perform instant **Rollbacks**.

### Session Security & Client Protection

* **JWT Refresh Automation**: Built-in 401 interception logic intelligently attempting background token renewals.
* **AuthProvider Stability**: Refactored provider ensures high-performance hydration and 100% reliable hook execution.
* **Request Interception**: Standardized fetch wrappers auto-injecting Bearer tokens.
* **Route Guards**: Client-side middleware protecting sensitive routes from anonymous access.

### Template Management
* **Template Library**: Central hub for managing all your communication assets.
* **Secure Deletion**: Remove custom templates with safety confirmation dialogs.
* **Mock Sending Verification**: Actionable interface designed to execute template string-replacements matching profiles.
* **Enhanced Test Send**: Dispatch real emails with active **Sample Data** for pixel-perfect verification.

### Authentication Persistence

* **Session Recovery**: Local storage integration for seamless login persistence.
* **Proactive Redirection**: Logged-in users are automatically routed from public pages to the dashboard.
* **Hook Stability**: Refactored `AuthProvider` ensures high-performance hydration and 100% reliable hook execution across the `AppRouter`.
* **Protocol Initialization**: Premium visual feedback during authentication state verification.

### Recipients Management

* Manage communication recipients
* Organize recipient lists
* Prepare audiences for campaigns

### Analytics

* Campaign performance tracking
* Engagement metrics
* Data visualization for communication insights

### AI Assistant

* AI-powered communication suggestions
* Smart reminder generation
* Automated assistance for campaign creation

### Settings

* User configuration
* Platform preferences
* Account management

---

## Installation

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

or

```bash
npm install --legacy-peer-deps
```

---

## Running the Development Server

Start the frontend development server:

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

## Build for Production

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

## Environment Variables

Create a `.env.local` file in the root of the frontend directory.

Example:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

This connects the frontend to the FastAPI backend.

---

## Backend Integration

The frontend communicates with the **CCIRP FastAPI backend** through REST APIs.

Example backend endpoint:

```
http://127.0.0.1:8000/api/
```

Ensure the backend server is running before using the frontend.

---

## Development Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build production version |
| `npm start`     | Run production server    |
| `npm run lint`  | Run ESLint               |

---

## Future Improvements

* Real-time notification updates
* Advanced analytics visualizations
* Mobile responsive enhancements
* Drag-and-drop campaign workflow builder
* SMS and WhatsApp template previews

---

## Related Project

This frontend is part of the **Central Communication and Intelligent Reminder Platform (CCIRP)**.

Backend repository contains:

* FastAPI APIs
* Authentication system
* Reminder scheduling
* Notification services
* AI logic

---

## Authors

Group 6 – Software Engineering Project

Contributors:

* CS23BTECH11007 Arnav Maiti
* CS23BTECH11009 Bhumin Hirpara
* CS23BTECH11023 Karan Gupta
* CS23BTECH11048 Pranjal Prajapati
* CS23BTECH11052 Roshan Y Singh
* CS23BTECH11060 Sujal Meshram

---

## License

This project is developed for **academic and research purposes**.
