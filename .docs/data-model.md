# Data Models: openquack

Version: 1.0  
Date: 16 January 2026

This document defines the data models used in the openquack API.

---

## User

Registered user account for premium features and email invitations. Created automatically via SSO (Google/GitHub) on first login.

```typescript
interface User {
  id: string;
  email: string; // unique, from SSO provider
  isPremium: boolean;
  provider: 'google' | 'github'; // authentication provider (SSO only)
  providerId: string; // provider-specific user ID (required for SSO)
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

## Board

Collaboration board with key-based access. Supports three modes: kanban, sprint-retro, and brainstorming. All boards created by registered users (via `ownerUserId`) are persistent and visible on their dashboard, regardless of whether the board is public or private.

```typescript
interface Board {
  id: string;
  key: string; // 6 alphanumeric characters, easy to pronounce, no 0 and O
  name: string;
  mode: 'kanban' | 'sprint-retro' | 'brainstorming';
  isPrivate: boolean;
  isAnonymous: boolean;
  ownerUserId: string; // required - creator must be registered
  createdAt: string; // ISO 8601
  expiresAt: string | null; // ISO 8601
  reactivationCount: number; // 0-4 for free users
}
```

## Invitation

Email invitation sent to join a private board as a permanent participant.

```typescript
interface Invitation {
  id: string;
  boardId: string;
  email: string;
  invitedByUserId: string; // board owner
  status: 'pending' | 'accepted' | 'expired';
  token: string; // unique invitation token
  expiresAt: string; // ISO 8601
  createdAt: string; // ISO 8601
  acceptedAt: string | null; // ISO 8601
}
```

## BoardMember

Permanent membership relationship between a registered user and a private board. Represents who has been invited and has access to the board, even when not actively participating.

```typescript
interface BoardMember {
  id: string;
  boardId: string;
  userId: string; // required - must be registered
  invitedByUserId: string; // board owner
  invitationId: string | null; // link to invitation if joined via email
  createdAt: string; // ISO 8601
}
```

## Participant

Active session representing someone currently on the board. Tracks presence, activity, and nickname for real-time collaboration. A BoardMember becomes a Participant when they join, but Participants can also be temporary (joined via key without membership).

```typescript
interface Participant {
  id: string;
  boardId: string;
  nickname: string; // unique per board session
  userId: string | null; // set if registered user (links to User for dashboard persistence)
  boardMemberId: string | null; // set if permanent participant (invited BoardMember)
  isCreator: boolean;
  joinedAt: string; // ISO 8601
  lastActiveAt: string; // ISO 8601
}
```

## BoardParticipation

Tracks registered users' participation history in boards (for dashboard persistence). Created when a registered user joins a board, persists even after they leave.

```typescript
interface BoardParticipation {
  id: string;
  boardId: string;
  userId: string; // required - must be registered
  firstJoinedAt: string; // ISO 8601
  lastActiveAt: string; // ISO 8601
  createdAt: string; // ISO 8601
}
```

## Column

Column or area in kanban/sprint-retro boards. Can be locked and ordered.

```typescript
interface Column {
  id: string;
  boardId: string;
  name: string;
  order: number;
  isLocked: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

## Item

Card or sticky note on a board. Can be placed in columns or positioned freely.

```typescript
interface Item {
  id: string;
  boardId: string;
  type: 'card' | 'sticky-note';
  content: string; // max 1000 characters
  columnId: string | null;
  position: { x: number; y: number };
  color: string; // hex, for sticky notes
  authorId: string;
  authorName: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

## Vote

Vote placed by a participant on an item (sprint-retro mode). Limit of 3-5 votes per participant.

```typescript
interface Vote {
  itemId: string;
  participantId: string;
  count: number; // 1-5
  createdAt: string; // ISO 8601
}
```

---

Clarified the difference between BoardMember and Participant:

1. BoardMember (permanent membership):

- Represents a persistent relationship between a registered user and a private board
- Exists even when the user is not actively on the board
- Tracks who has been invited and has access
- Only for private boards with invited users

2. Participant (active session):

- Represents someone currently active on the board
- Tracks presence, activity, and nickname for real-time collaboration
- Temporary — created when joining, removed when leaving
- Can be:
  - A BoardMember who joined (permanent participant) — boardMemberId is set
  - Someone who joined via key (temporary participant) — boardMemberId is null

3. Relationship:

- A BoardMember becomes a Participant when they join the board
- A Participant can exist without a BoardMember (temporary key-based join)
- BoardMember = "who has access" (persistent)
- Participant = "who is currently here" (temporary session)
- Removed the duplicate Participant definition.
