# API Specification: openquack

Version: 1.0  
Date: 16 January 2026  
Base URL: `https://api.openquack.app/v1`

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [User Management](#user-management)
3. [Board Management](#board-management)
4. [Participant Management](#participant-management)
5. [Board Items Management](#board-items-management)
6. [Voting](#voting)
7. [Real-Time Collaboration](#real-time-collaboration)
8. [Moderation](#moderation)
9. [Export](#export)
10. [Invitations](#invitations)
11. [Board Members](#board-members)
12. [Error Handling](#error-handling)

---

## Authentication & Authorization

### Key-Based Access

- Boards are accessed via a unique **Key** (6 alphanumeric characters)
- Participants join with Key + Nickname (no registration required)
- Creator receives a **Creator Token** upon board creation for privileged operations

### Creator Token

- Generated upon board creation
- Required for moderation operations
- Stored client-side (localStorage/sessionStorage)

### Premium Features

- Private boards require premium account
- Email invitations require registered user account
- Board expiration: 7 days (free) vs unlimited (premium)

### User Token

- Generated upon SSO login (Google or GitHub)
- Required for user dashboard and board member operations
- Stored client-side (localStorage/sessionStorage)

### SSO Authentication

- Google OAuth 2.0: Users sign in with Google account (automatic registration on first login)
- GitHub OAuth 2.0: Users sign in with GitHub account (automatic registration on first login)
- No email/password authentication - SSO only
- First-time SSO users are automatically registered

---

## User Management

Users are registered automatically upon first SSO login with Google or GitHub. No separate registration step is required.

### Login with Google SSO

**POST** `/users/login/google`

Authenticates or registers a user via Google OAuth SSO.

**Request Body:**

```json
{
  "code": "string (required, OAuth authorization code)",
  "redirectUri": "string (required, must match registered redirect URI)"
}
```

**Response:** `200 OK` or `201 Created`

```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "isPremium": false,
    "provider": "google"
  },
  "token": "jwt-token",
  "isNewUser": false
}
```

**Error Responses:**

- `400 Bad Request`: Invalid authorization code or redirect URI
- `401 Unauthorized`: Invalid Google OAuth token

---

### Login with GitHub SSO

**POST** `/users/login/github`

Authenticates or registers a user via GitHub OAuth SSO.

**Request Body:**

```json
{
  "code": "string (required, OAuth authorization code)",
  "redirectUri": "string (required, must match registered redirect URI)"
}
```

**Response:** `200 OK` or `201 Created`

```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "isPremium": false,
    "provider": "github"
  },
  "token": "jwt-token",
  "isNewUser": false
}
```

**Error Responses:**

- `400 Bad Request`: Invalid authorization code or redirect URI
- `401 Unauthorized`: Invalid GitHub OAuth token

---

### Get SSO Authorization URL

**GET** `/users/oauth/{provider}/authorize`

Retrieves the OAuth authorization URL for the specified provider.

**Path Parameters:**

- `provider`: `google` | `github`

**Query Parameters:**

```
?redirectUri={redirectUri} (required)
&state={state} (optional, for CSRF protection)
```

**Response:** `200 OK`

```json
{
  "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "state": "string (CSRF token)"
}
```

---

### Get User Dashboard

**GET** `/users/me/boards`

Retrieves boards for the authenticated user (created boards and boards they've participated in).

**Headers:**

```
Authorization: Bearer {userToken}
```

**Query Parameters:**

```
?type=created|participated|all (optional, defaults to 'all')
```

**Response:** `200 OK`

```json
{
  "created": [
    {
      "id": "uuid",
      "key": "ABC123XY",
      "name": "string",
      "mode": "kanban",
      "isPrivate": false,
      "createdAt": "ISO 8601 timestamp",
      "expiresAt": "ISO 8601 timestamp | null"
    }
  ],
  "participated": [
    {
      "id": "uuid",
      "key": "XYZ789AB",
      "name": "string",
      "mode": "sprint-retro",
      "isPrivate": false,
      "firstJoinedAt": "ISO 8601 timestamp",
      "lastActiveAt": "ISO 8601 timestamp"
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid user token

---

## Board Management

### Create Board

**POST** `/boards`

Creates a new collaboration board. Creator must be a registered user. Board will be persistent on creator's dashboard.

**Limitations:**

- Free users can create a maximum of 3 boards
- Premium users have unlimited board creation
- Creator must be registered

**Headers:**

```
Authorization: Bearer {userToken}
```

**Request Body:**

```json
{
  "mode": "kanban" | "sprint-retro" | "brainstorming",
  "name": "string (optional, defaults to 'Untitled Board')",
  "isPrivate": "boolean (optional, defaults to false, requires premium)",
  "expirationDays": "number (optional, defaults to 7 for free users, unlimited for premium)"
}
```

**Response:** `201 Created`

```json
{
  "board": {
    "id": "uuid",
    "key": "ABC123XY",
    "name": "string",
    "mode": "kanban" | "sprint-retro" | "brainstorming",
    "isPrivate": false,
    "createdAt": "ISO 8601 timestamp",
    "expiresAt": "ISO 8601 timestamp | null",
    "creatorToken": "jwt-token",
    "joinUrl": "https://openquack.app/join/ABC123XY"
  }
}
```

**Default Columns/Areas by Mode:**

- **kanban**: `["To Do", "In Progress", "Done"]`
- **sprint-retro**: `["Went Well", "To Improve", "Action Items", "Kudos"]`
- **brainstorming**: `[]` (empty board)

**Error Responses:**

- `403 Forbidden`: Free user has reached maximum board creation limit (3 boards)
- `400 Bad Request`: Invalid request parameters (invalid mode, etc.)

---

### Get Board

**GET** `/boards/{key}`

Retrieves board details and current state.

**Headers:**

```
X-Participant-Id: uuid (optional, if already joined)
```

**Response:** `200 OK`

```json
{
  "board": {
    "id": "uuid",
    "key": "ABC123XY",
    "name": "string",
    "mode": "kanban" | "sprint-retro" | "brainstorming",
    "isPrivate": false,
    "createdAt": "ISO 8601 timestamp",
    "expiresAt": "ISO 8601 timestamp | null",
    "isAnonymous": false,
    "columns": [
      {
        "id": "uuid",
        "name": "string",
        "order": 0,
        "isLocked": false
      }
    ],
    "items": [
      {
        "id": "uuid",
        "type": "card" | "sticky-note",
        "content": "string",
        "columnId": "uuid",
        "position": { "x": 0, "y": 0 },
        "color": "string (hex, for sticky notes)",
        "authorId": "uuid",
        "authorName": "string (hidden if anonymous)",
        "createdAt": "ISO 8601 timestamp",
        "updatedAt": "ISO 8601 timestamp"
      }
    ],
    "votes": [
      {
        "itemId": "uuid",
        "participantId": "uuid",
        "count": 1
      }
    ],
    "participants": [
      {
        "id": "uuid",
        "nickname": "string",
        "joinedAt": "ISO 8601 timestamp",
        "isCreator": false
      }
    ]
  }
}
```

**Error Responses:**

- `404 Not Found`: Board not found
- `410 Gone`: Board has expired
- `403 Forbidden`: Private board access denied

---

### Update Board

**PATCH** `/boards/{key}`

Updates board settings (name, anonymity, etc.).

**Headers:**

```
Authorization: Bearer {creatorToken}
```

**Request Body:**

```json
{
  "name": "string (optional)",
  "isAnonymous": "boolean (optional)"
}
```

**Response:** `200 OK`

```json
{
  "board": {
    "id": "uuid",
    "name": "string",
    "isAnonymous": false,
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing creator token
- `403 Forbidden`: Not the board creator

---

### Reactivate Board

**POST** `/boards/{key}/reactivate`

Extends board expiration (free users: max 4 reactivations, 7 days each).

**Headers:**

```
Authorization: Bearer {creatorToken}
```

**Response:** `200 OK`

```json
{
  "board": {
    "id": "uuid",
    "expiresAt": "ISO 8601 timestamp",
    "reactivationCount": 2
  }
}
```

**Error Responses:**

- `400 Bad Request`: Maximum reactivations reached (free users)
- `401 Unauthorized`: Invalid creator token

---

### Delete Board

**DELETE** `/boards/{key}`

Permanently deletes a board and all its content.

**Headers:**

```
Authorization: Bearer {creatorToken}
```

**Response:** `204 No Content`

**Error Responses:**

- `401 Unauthorized`: Invalid creator token
- `403 Forbidden`: Not the board creator

---

## Participant Management

### Join Board

**POST** `/boards/{key}/participants`

Joins a board as a participant. If user is registered and authenticated, participation will be tracked for dashboard persistence.

**Headers:**

```
Authorization: Bearer {userToken} (optional, for registered users)
```

**Request Body:**

```json
{
  "nickname": "string (required, 1-50 characters)"
}
```

**Response:** `201 Created`

```json
{
  "participant": {
    "id": "uuid",
    "nickname": "string",
    "boardId": "uuid",
    "joinedAt": "ISO 8601 timestamp",
    "sessionToken": "jwt-token"
  }
}
```

**Error Responses:**

- `404 Not Found`: Board not found
- `410 Gone`: Board has expired
- `403 Forbidden`: Private board access denied
- `400 Bad Request`: Invalid nickname or board at capacity (50 participants)

---

### Leave Board

**POST** `/boards/{key}/participants/{participantId}/leave`

Removes a participant from the board.

**Headers:**

```
Authorization: Bearer {sessionToken}
```

**Response:** `204 No Content`

**Error Responses:**

- `401 Unauthorized`: Invalid session token
- `404 Not Found`: Participant not found

---

### Get Participants

**GET** `/boards/{key}/participants`

Retrieves list of active participants.

**Response:** `200 OK`

```json
{
  "participants": [
    {
      "id": "uuid",
      "nickname": "string",
      "isCreator": false,
      "joinedAt": "ISO 8601 timestamp",
      "lastActiveAt": "ISO 8601 timestamp"
    }
  ]
}
```

---

## Board Items Management

### Create Item

**POST** `/boards/{key}/items`

Creates a new card or sticky note.

**Headers:**

```
Authorization: Bearer {sessionToken}
```

**Request Body:**

```json
{
  "type": "card" | "sticky-note",
  "content": "string (required, max 1000 characters)",
  "columnId": "uuid (required for kanban and sprint-retro)",
  "position": {
    "x": 0,
    "y": 0
  },
  "color": "string (hex, optional, for sticky notes)"
}
```

**Note:** `position` is optional for kanban and sprint-retro modes (items are organized by column). It is required for brainstorming mode.

**Response:** `201 Created`

```json
{
  "item": {
    "id": "uuid",
    "type": "card" | "sticky-note",
    "content": "string",
    "columnId": "uuid",
    "position": { "x": 0, "y": 0 },
    "color": "#FFEB3B",
    "authorId": "uuid",
    "authorName": "string",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid content, column not found, or board at item limit (500)
- `401 Unauthorized`: Invalid session token
- `403 Forbidden`: Column is locked

---

### Update Item

**PATCH** `/boards/{key}/items/{itemId}`

Updates an existing item (content, position, color).

**Headers:**

```
Authorization: Bearer {sessionToken}
```

**Request Body:**

```json
{
  "content": "string (optional)",
  "position": {
    "x": 0,
    "y": 0
  },
  "color": "string (hex, optional, for sticky notes)"
}
```

**Response:** `200 OK`

```json
{
  "item": {
    "id": "uuid",
    "content": "string",
    "position": { "x": 0, "y": 0 },
    "color": "#FFEB3B",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid session token
- `403 Forbidden`: Not the item author (unless creator)
- `404 Not Found`: Item not found

---

### Move Item

**PATCH** `/boards/{key}/items/{itemId}/move`

Moves an item to a different column (kanban) or position (brainstorming).

**Headers:**

```
Authorization: Bearer {sessionToken}
```

**Request Body:**

```json
{
  "columnId": "uuid (required for kanban/sprint-retro, optional for brainstorming)",
  "position": {
    "x": 0,
    "y": 0
  }
}
```

**Note:**

- For kanban and sprint-retro: `columnId` is required, `position` is optional
- For brainstorming: `position` is required, `columnId` is optional

**Response:** `200 OK`

```json
{
  "item": {
    "id": "uuid",
    "columnId": "uuid",
    "position": { "x": 0, "y": 0 },
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid column or position
- `401 Unauthorized`: Invalid session token
- `403 Forbidden`: Column is locked

---

### Delete Item

**DELETE** `/boards/{key}/items/{itemId}`

Deletes an item. Participants can only delete their own items; creators can delete any item.

**Headers:**

```
Authorization: Bearer {sessionToken}
```

**Response:** `204 No Content`

**Error Responses:**

- `401 Unauthorized`: Invalid session token
- `403 Forbidden`: Not the item author (unless creator)
- `404 Not Found`: Item not found

---

### Column Management

#### Create Column

**POST** `/boards/{key}/columns`

Creates a new column (kanban mode only).

**Headers:**

```
Authorization: Bearer {creatorToken}
```

**Request Body:**

```json
{
  "name": "string (required, 1-50 characters)",
  "order": 0
}
```

**Response:** `201 Created`

```json
{
  "column": {
    "id": "uuid",
    "name": "string",
    "order": 0,
    "isLocked": false,
    "createdAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid mode (not kanban) or maximum columns reached
- `401 Unauthorized`: Invalid creator token

---

#### Update Column

**PATCH** `/boards/{key}/columns/{columnId}`

Updates column name or lock status.

**Headers:**

```
Authorization: Bearer {creatorToken}
```

**Request Body:**

```json
{
  "name": "string (optional)",
  "isLocked": "boolean (optional)"
}
```

**Response:** `200 OK`

```json
{
  "column": {
    "id": "uuid",
    "name": "string",
    "isLocked": false,
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid creator token
- `404 Not Found`: Column not found

---

#### Delete Column

**DELETE** `/boards/{key}/columns/{columnId}`

Deletes a column and moves all items to the first remaining column.

**Headers:**

```
Authorization: Bearer {creatorToken}
```

**Response:** `204 No Content`

**Error Responses:**

- `400 Bad Request`: Cannot delete last column
- `401 Unauthorized`: Invalid creator token
- `404 Not Found`: Column not found

---

## Voting

### Add Vote

**POST** `/boards/{key}/items/{itemId}/votes`

Adds a vote to an item (sprint-retro mode only).

**Headers:**

```
Authorization: Bearer {sessionToken}
```

**Request Body:**

```json
{
  "count": 1
}
```

**Response:** `201 Created`

```json
{
  "vote": {
    "itemId": "uuid",
    "participantId": "uuid",
    "count": 1,
    "totalVotes": 5
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid mode, exceeds vote limit (3-5 per participant), or invalid count
- `401 Unauthorized`: Invalid session token
- `404 Not Found`: Item not found

---

### Remove Vote

**DELETE** `/boards/{key}/items/{itemId}/votes`

Removes a vote from an item.

**Headers:**

```
Authorization: Bearer {sessionToken}
```

**Response:** `204 No Content`

**Error Responses:**

- `401 Unauthorized`: Invalid session token
- `404 Not Found`: Vote not found

---

### Get Votes

**GET** `/boards/{key}/items/{itemId}/votes`

Retrieves all votes for an item.

**Response:** `200 OK`

```json
{
  "votes": [
    {
      "participantId": "uuid",
      "count": 1
    }
  ],
  "totalVotes": 5
}
```

---

### Reset All Votes

**POST** `/boards/{key}/votes/reset`

Resets all votes on the board (creator only).

**Headers:**

```
Authorization: Bearer {creatorToken}
```

**Response:** `200 OK`

```json
{
  "message": "All votes reset",
  "resetAt": "ISO 8601 timestamp"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid creator token

---

## Real-Time Collaboration

### WebSocket Connection

**WS** `/ws/boards/{key}`

Establishes a WebSocket connection for real-time updates.

**Query Parameters:**

```
?token={sessionToken}
```

**Connection Events:**

#### Client → Server

**Join Board:**

```json
{
  "type": "join",
  "participantId": "uuid"
}
```

**Cursor Position:**

```json
{
  "type": "cursor",
  "participantId": "uuid",
  "position": { "x": 0, "y": 0 }
}
```

**Editing Indicator:**

```json
{
  "type": "editing",
  "participantId": "uuid",
  "itemId": "uuid",
  "isEditing": true
}
```

#### Server → Client

**Item Created:**

```json
{
  "type": "item.created",
  "item": {
    "id": "uuid",
    "type": "card",
    "content": "string",
    "columnId": "uuid",
    "authorId": "uuid",
    "authorName": "string",
    "createdAt": "ISO 8601 timestamp"
  }
}
```

**Item Updated:**

```json
{
  "type": "item.updated",
  "item": {
    "id": "uuid",
    "content": "string",
    "position": { "x": 0, "y": 0 },
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

**Item Deleted:**

```json
{
  "type": "item.deleted",
  "itemId": "uuid"
}
```

**Item Moved:**

```json
{
  "type": "item.moved",
  "itemId": "uuid",
  "columnId": "uuid",
  "position": { "x": 0, "y": 0 }
}
```

**Participant Joined:**

```json
{
  "type": "participant.joined",
  "participant": {
    "id": "uuid",
    "nickname": "string",
    "joinedAt": "ISO 8601 timestamp"
  }
}
```

**Participant Left:**

```json
{
  "type": "participant.left",
  "participantId": "uuid"
}
```

**Cursor Update:**

```json
{
  "type": "cursor.update",
  "participantId": "uuid",
  "position": { "x": 0, "y": 0 }
}
```

**Editing Status:**

```json
{
  "type": "editing.status",
  "participantId": "uuid",
  "itemId": "uuid",
  "isEditing": true
}
```

**Vote Added:**

```json
{
  "type": "vote.added",
  "itemId": "uuid",
  "participantId": "uuid",
  "totalVotes": 5
}
```

**Vote Removed:**

```json
{
  "type": "vote.removed",
  "itemId": "uuid",
  "participantId": "uuid",
  "totalVotes": 4
}
```

**Board Updated:**

```json
{
  "type": "board.updated",
  "board": {
    "name": "string",
    "isAnonymous": false
  }
}
```

---

## Moderation

### Clear Board

**POST** `/boards/{key}/clear`

Deletes all items from the board (creator only).

**Headers:**

```
Authorization: Bearer {creatorToken}
```

**Request Body:**

```json
{
  "confirm": true
}
```

**Response:** `200 OK`

```json
{
  "message": "Board cleared",
  "clearedAt": "ISO 8601 timestamp",
  "itemsDeleted": 42
}
```

**Error Responses:**

- `400 Bad Request`: Missing confirmation
- `401 Unauthorized`: Invalid creator token

---

### Delete Any Item

**DELETE** `/boards/{key}/items/{itemId}`

Creators can delete any item regardless of author.

**Headers:**

```
Authorization: Bearer {creatorToken}
```

**Response:** `204 No Content`

**Error Responses:**

- `401 Unauthorized`: Invalid creator token
- `404 Not Found`: Item not found

---

## Export

### Export as Image

**GET** `/boards/{key}/export/image`

Exports the board as a PNG image.

**Headers:**

```
Authorization: Bearer {creatorToken} (optional, but recommended)
```

**Query Parameters:**

```
?format=png
&width=1920 (optional)
&height=1080 (optional)
```

**Response:** `200 OK`

```
Content-Type: image/png
Content-Disposition: attachment; filename="board-ABC123XY.png"

[binary PNG data]
```

**Error Responses:**

- `404 Not Found`: Board not found
- `500 Internal Server Error`: Export generation failed

---

### Export as Text

**GET** `/boards/{key}/export/text`

Exports the board as a plain text document.

**Headers:**

```
Authorization: Bearer {creatorToken} (optional, but recommended)
```

**Query Parameters:**

```
?format=txt
```

**Response:** `200 OK`

```
Content-Type: text/plain
Content-Disposition: attachment; filename="board-ABC123XY.txt"

Board: {name}
Mode: {mode}
Created: {createdAt}

Columns:
- {column1}
- {column2}

Items:
[Column: {column1}]
- {item1}
- {item2}

[Column: {column2}]
- {item3}
...
```

**Error Responses:**

- `404 Not Found`: Board not found

---

## Invitations

### Send Email Invitation

**POST** `/boards/{key}/invitations`

Sends email invitations to join a private board (registered users only).

**Headers:**

```
Authorization: Bearer {userToken}
```

**Request Body:**

```json
{
  "emails": ["user1@example.com", "user2@example.com"],
  "message": "string (optional)"
}
```

**Response:** `201 Created`

```json
{
  "invitations": [
    {
      "id": "uuid",
      "email": "user1@example.com",
      "status": "pending",
      "sentAt": "ISO 8601 timestamp",
      "expiresAt": "ISO 8601 timestamp"
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid user token or not registered
- `400 Bad Request`: Invalid email addresses or board is public
- `403 Forbidden`: Not the board creator

---

### Accept Invitation

**POST** `/invitations/{token}/accept`

Accepts an email invitation to join a private board. User must be registered.

**Headers:**

```
Authorization: Bearer {userToken}
```

**Response:** `200 OK`

```json
{
  "board": {
    "id": "uuid",
    "key": "ABC123XY",
    "name": "string",
    "mode": "kanban"
  },
  "boardMember": {
    "id": "uuid",
    "boardId": "uuid",
    "userId": "uuid",
    "createdAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid user token
- `404 Not Found`: Invitation not found or expired
- `409 Conflict`: User is already a board member

---

## Board Members

### Get Board Members

**GET** `/boards/{key}/members`

Retrieves list of permanent board members (for private boards).

**Headers:**

```
Authorization: Bearer {userToken}
```

**Response:** `200 OK`

```json
{
  "members": [
    {
      "id": "uuid",
      "userId": "uuid",
      "email": "string",
      "joinedAt": "ISO 8601 timestamp"
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid user token
- `403 Forbidden`: Not authorized to view board members
- `400 Bad Request`: Board is public (no members)

---

### Remove Board Member

**DELETE** `/boards/{key}/members/{memberId}`

Removes a board member from a private board (board owner only).

**Headers:**

```
Authorization: Bearer {userToken}
```

**Response:** `204 No Content`

**Error Responses:**

- `401 Unauthorized`: Invalid user token
- `403 Forbidden`: Not the board owner
- `404 Not Found`: Board member not found

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} (optional)
  }
}
```

### HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `204 No Content`: Successful deletion/update with no response body
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `410 Gone`: Resource has expired or is no longer available
- `409 Conflict`: Resource conflict (e.g., duplicate key)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

### Common Error Codes

- `BOARD_NOT_FOUND`: Board does not exist
- `BOARD_EXPIRED`: Board has expired and cannot be reactivated
- `INVALID_KEY`: Invalid board key format
- `INVALID_TOKEN`: Invalid authentication token
- `UNAUTHORIZED`: Missing or invalid authorization
- `FORBIDDEN`: Insufficient permissions
- `BOARD_AT_CAPACITY`: Board has reached maximum participants (50)
- `ITEM_LIMIT_REACHED`: Board has reached maximum items (500)
- `VOTE_LIMIT_REACHED`: Participant has reached vote limit
- `COLUMN_LOCKED`: Column is locked and cannot be modified
- `INVALID_MODE`: Operation not supported for board mode
- `REACTIVATION_LIMIT_REACHED`: Maximum reactivations reached (free users)
- `BOARD_CREATION_LIMIT_REACHED`: Free user has reached maximum board creation limit (3 boards)

---

## Rate Limiting

- **Board Creation**: 10 per hour per IP
- **Join Requests**: 20 per hour per IP
- **Item Operations**: 100 per minute per participant
- **WebSocket Connections**: 5 concurrent connections per IP
- **Export Requests**: 10 per hour per board

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Data Models

For detailed data model definitions, see [Data Models](./data-model.md).

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Board keys are generated to avoid ambiguous characters (0/O, 1/I/l)
- Maximum board capacity: 50 participants
- Maximum items per board: 500
- Board expiration: 7 days (free users, max 4 reactivations) or unlimited (premium)
- Inactive boards (>30 days) are automatically deleted
- Real-time updates should propagate within 1 second
- Board load time should be <3 seconds
