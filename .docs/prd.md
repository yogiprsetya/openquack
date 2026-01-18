# Product Requirements Document: openquack

Version: 1.0
Date: 16 Januari 2026
Author: Yogi Prasetya

## 1. Product Overview

Openquack is a lightweight, accessible, and real-time digital collaboration board application. Unlike collaboration tools that require complex logins, Openquack adopts a Kahoot-style "key" approach, where anyone with a unique key can instantly join a board. This application is intended for quick brainstorming sessions, team meetings, workshops, or retrospectives that require easy participation without registration barriers.

Unique Value:

- Frictionless Access: Join simply by entering your "Key" and name
- Multi-Mode Board: One platform for various needs (Kanban, Sprint Retrospective, Voting, etc.)
- Real-Time Collaboration: Changes are immediately visible to all participants

Important notes: Creator can set their board as private (premium user), and invite team by email (regristed user).

## 2. Goals & Objectives

Business Objective:

- Provide a simple visual collaboration tool for teams, coaches, facilitators, and educators
- Become the preferred choice for ad-hoc and structured collaboration sessions with easy sign-in
- Achieve organic user acquisition through ease of sharing and use

Goals for Version 1.0 (MVP):

- Support board creation with 3 modes: Kanban, Sprint Retrospective, and Brainstorming Sticky Notes
- Implement a "Key"-based access system
- Deliver a stable real-time collaboration experience for up to 50 users per board
- Average time from "get key" to "start collaborating" < 30 seconds

## 3. User Personas

1. Agile Facilitator: A Scrum Master who wants to hold retrospective sessions with a distributed team. Needs a quick way to gather feedback and vote
2. Project Manager: Wants to create a simple kanban to track tasks without having to teach the team complex tools
3. Lecturer/Trainer: Needs a digital board for brainstorming sessions in class or workshops, where students/participants can participate directly from their devices
4. Participant: A team member or attendee who simply wants to join, contribute, and leave without having to create an account

## 4. Key Features & Functional Specifications

### Feature 1: Board Creation & Access via Key

Creator Flow:

1. The creator must sign in with Google or GitHub SSO (account created automatically on first login)
2. The creator opens the CollabBoard website
3. Click "Create New Board."
4. Select a Mode: Kanban, Sprint Retro, or Sticky Notes
5. The system automatically generates a Key (6 alphanumeric characters, easy to pronounce)
6. The creator is given a unique link (e.g., collabboard.app/join/ABC123) and a Key
7. The creator can change the board name
8. The creator shares the Key or Link with participants
9. The board appears on the creator's dashboard for easy access

Participant Flow:

1. Open the link or visit collabboard.app/join
2. Enter their Key and Nickname
3. Directly enter the active board
4. If registered user, the board will appear on their dashboard for future access

Board Behavior:

1. Each board can be set as public or private (paid user)
2. The board has an expiration date of up to 7 days for free users, creators must reactivate it up to 4 times.
3. Boards created by paid users can live forever
4. Expired (4 times reactivate) board will be read-only
5. Free user can own 3 boards
6. All boards created by registered users are persistent on their dashboard
7. Registered users can also see boards they've participated in on their dashboard (for easy access)
8. Private boards have permanent members (invited registered users) who have persistent access

### Feature 2: Collaborative Board Mode

#### Mode 1: Kanban Board

- Default columns: "To Do," "In Progress," "Done
- Creators can add/remove/rename columns
- All users can: Add cards (tasks), drag and drop cards between columns, and edit/delete cards they create
- Creators can lock columns or delete cards belonging to anyone

#### Mode 2: Sprint Retrospective

- Board with 4 areas: Went Well, To Improve, Action Items, Kudos
- Participants can add sticky notes in any area
- Dot Voting feature (Each participant gets 3-5 dots to place on their favorite sticky notes)
- Optional anonymity (only the Creator can see the note author)

#### Mode 3: Brainstorming (Sticky Notes)

- Blank board with a color palette of sticky notes
- Participants can add, drag, change the color of, and edit notes
- Manual clustering feature by drawing areas

#### Feature 3: Real-Time Collaboration

- All changes (add, edit, delete, drag) are synchronized to all online users within seconds
- Cursor position/avatar indicator for other active participants
- Indicator of who is editing an item (if relevant)

#### Feature 4: Control & Moderation (Creator Privileges)

- "Clear Board" button: Delete all content (with confirmation)
- Export Board: Download the board as an image (PNG) or text document (.txt)
- Toggle Anonymous: Hide/show the name of the sticky note creator
- Delete/Edit Any Item: Creators can moderate any content
- Reset Voting: Reset all voting dots

## 5. Non-Functional Specifications

- Performance: Board load time <3 seconds. Real-time update latency <1 second
- Reliability: 99% uptime during peak business hours
- Scalability: Supports up to 10,000 concurrently active boards
- Security:
  - Keys must be sufficiently random and not easily guessed
  - No sensitive personal data is stored
  - Boards inactive for >30 days are automatically deleted
- Compatibility: Works optimally on desktop browsers (Chrome, Edge, Safari, Firefox) and mobile (responsive design)

## 6. Limitations & Assumptions

- Assumption: Users have a stable internet connection
- Board creators must be registered users
- Participants can join without registration (key-based access)
- MVP Limitations: No chat feature within the board
- Registered users can see created and participated boards on their dashboard
- Technical Limitations: Maximum number of items per board (e.g., 500 sticky notes) to maintain performance

## 7. Metrik Keberhasilan (KPI)

### Penggunaan Aktif:

- Jumlah Papan Dibuat per Hari
- Rata-rata Jumlah Partisipan per Papan
- Waktu Rata-rata Sesi per Papan

### Kepuasan Pengguna:

- Net Promoter Score (NPS) dari survey in-app
- Rasio Pengguna Kembali (Creator membuat papan lagi dalam 7 hari)

### Kinerja Teknis:

- Tingkat keberhasilan bergabung (join success rate)
- Latensi kolaborasi real-time

## Additional Notes

- "Key" Name: Make sure it's easy to read and pronounce (avoid the number 0 vs. the letter O, etc.)
- UI/UX: Should be highly intuitive. Consider a short walkthrough the first time a Creator creates a board
- Offline First: For future versions, consider offline editing capabilities that will sync when back online
