# Architecture Decisions: openquack

Version: 1.0  
Date: 16 January 2026

This document records the architectural decisions made for the openquack project. Each decision includes the context, rationale, and consequences.

---

## Table of Contents

1. [Key-Based Access Model](#1-key-based-access-model)
2. [Hybrid Authentication Strategy](#2-hybrid-authentication-strategy)
3. [Real-Time Collaboration Architecture](#3-real-time-collaboration-architecture)
4. [Data Model: Participant vs BoardMember Separation](#4-data-model-participant-vs-boardmember-separation)
5. [Board Expiration and Reactivation System](#5-board-expiration-and-reactivation-system)
6. [Multi-Mode Board Architecture](#6-multi-mode-board-architecture)
7. [Creator Token Pattern](#7-creator-token-pattern)
8. [REST API with WebSocket Hybrid](#8-rest-api-with-websocket-hybrid)
9. [SSO-Only User Registration](#9-sso-only-user-registration)
10. [Dashboard Persistence Strategy](#10-dashboard-persistence-strategy)

---

## 1. Key-Based Access Model

### Context

The application needs to provide frictionless access for participants while maintaining security and board integrity. Traditional authentication (email/password) creates barriers for quick collaboration sessions.

### Decision

Implement a Kahoot-style key-based access system where:
- Each board has a unique 6-character alphanumeric key (pronounceable, avoids ambiguous characters like 0/O, 1/I/l)
- Participants join by entering the key and a nickname (no registration required)
- The key serves as the primary access mechanism for public boards

### Rationale

- **Frictionless Participation**: Participants can join in <30 seconds without account creation
- **Easy Sharing**: Keys are short, memorable, and can be verbally communicated
- **Security**: 6-character keys with character restrictions provide sufficient entropy while remaining user-friendly
- **Familiar UX Pattern**: Similar to Kahoot/Mentimeter, which users already understand

### Consequences

- **Positive**:
  - Low barrier to entry increases adoption
  - Enables ad-hoc collaboration without setup overhead
  - Reduces user friction metrics

- **Negative**:
  - Keys must be managed to ensure uniqueness
  - Potential security concerns if keys are guessed (mitigated by character restrictions and key generation algorithm)
  - Requires careful handling of board visibility (public vs private)

---

## 2. Hybrid Authentication Strategy

### Context

The system serves two distinct user types:
- **Creators**: Need persistent accounts for board management and premium features
- **Participants**: Should join quickly without registration barriers

### Decision

Implement a dual authentication model:
- **SSO Authentication (Google/GitHub)**: Required for creators and registered participants
- **Key-Based Access**: No authentication required for participants joining public boards
- **Session Tokens**: Issued for participants to authorize actions during their session

### Rationale

- **Creator Requirements**: Creators need persistent identity for board ownership, dashboard access, and premium features
- **Participant Flexibility**: Participants shouldn't be blocked by registration requirements
- **Security**: SSO provides secure authentication without password management overhead
- **Flexibility**: Registered participants can still join via key but get dashboard persistence

### Consequences

- **Positive**:
  - Balances security needs with ease of access
  - SSO reduces password management complexity
  - Enables progressive user engagement (anonymous → registered)

- **Negative**:
  - Two authentication flows increase complexity
  - Requires careful token management (userToken, creatorToken, sessionToken)
  - Need to handle anonymous participant actions securely

---

## 3. Real-Time Collaboration Architecture

### Context

The application requires real-time synchronization of board state (items, positions, votes) across multiple participants. Updates must propagate within 1 second for acceptable user experience.

### Decision

Implement a hybrid communication architecture:
- **WebSocket (WS)**: Primary channel for real-time bidirectional communication
- **REST API**: Used for initial board loading, mutations, and state initialization
- **Event-Driven Updates**: Server broadcasts state changes via WebSocket events to all connected participants

### Rationale

- **WebSocket Benefits**: Low-latency, persistent connections ideal for real-time collaboration
- **REST for Initialization**: HTTP is simpler for initial board state retrieval and non-real-time operations
- **Event-Driven**: Decouples operations from synchronization, allowing efficient broadcast to all participants
- **Scalability**: WebSocket connections can be managed at scale with proper connection pooling

### Consequences

- **Positive**:
  - Achieves <1 second update latency requirement
  - Efficient bandwidth usage (only changed state is transmitted)
  - Supports cursor tracking and presence indicators

- **Negative**:
  - Increased server complexity (connection management, reconnection handling)
  - Higher server resource usage (persistent connections)
  - Need to handle connection failures and state reconciliation

---

## 4. Data Model: Participant vs BoardMember Separation

### Context

The system needs to distinguish between:
- **Permanent membership**: Users who have persistent access to private boards
- **Active session**: Users currently viewing/editing a board

### Decision

Separate the concepts into two distinct entities:
- **BoardMember**: Persistent membership relationship (for private boards, invited registered users)
- **Participant**: Active session representation (temporary, tracks presence and activity)

### Rationale

- **Semantic Clarity**: Different lifecycle and purpose (persistent vs ephemeral)
- **Access Control**: BoardMember defines who *can* access; Participant tracks who *is* accessing
- **Dashboard Requirements**: Registered participants need history tracking (BoardParticipation) separate from active sessions
- **Flexibility**: Supports both key-based temporary participation and permanent membership

### Consequences

- **Positive**:
  - Clear separation of concerns
  - Enables both temporary and permanent access patterns
  - Supports presence tracking independently of membership

- **Negative**:
  - More complex data model
  - Requires careful synchronization between entities
  - Potential for state inconsistencies if not handled carefully

---

## 5. Board Expiration and Reactivation System

### Context

Free users should have limits on board lifetime, but boards shouldn't be permanently deleted without warning. Premium users should have unlimited board lifetime.

### Decision

Implement a time-based expiration system with reactivation limits:
- **Free Users**: Boards expire after 7 days, can be reactivated up to 4 times (total ~35 days active)
- **Premium Users**: Boards never expire (expiresAt = null)
- **Expired Boards**: Become read-only after maximum reactivations
- **Inactive Boards**: Automatically locked after 30 days

### Rationale

- **Resource Management**: Prevents unlimited board growth from free users
- **User Control**: Reactivation allows users to extend boards when needed
- **Monetization**: Encourages premium subscription for long-term board management
- **Data Cleanup**: Automatic deletion of inactive boards prevents database bloat

### Consequences

- **Positive**:
  - Manages infrastructure costs
  - Provides clear value proposition for premium tier
  - Prevents stale data accumulation

- **Negative**:
  - Complex expiration logic requiring scheduled jobs
  - Potential user frustration if boards expire unexpectedly
  - Need clear UI indicators for expiration status

---

## 6. Multi-Mode Board Architecture

### Context

The application needs to support three distinct board types (Kanban, Sprint Retrospective, Brainstorming) with different behaviors, layouts, and features.

### Decision

Implement a single unified Board entity with a `mode` field that determines behavior:
- **Single Entity**: One Board model with mode-specific configuration
- **Mode-Driven Logic**: Application logic adapts based on `mode` value
- **Shared Infrastructure**: All modes share the same real-time sync, participant management, and item storage

### Rationale

- **Code Reuse**: Common infrastructure (realtime sync, participants, items) works for all modes
- **Flexibility**: Easy to add new modes without duplicating core functionality
- **Consistency**: Unified data model simplifies API design and client code
- **Maintainability**: Single codebase for board operations reduces duplication

### Consequences

- **Positive**:
  - Faster development of new modes
  - Consistent behavior across modes
  - Shared optimizations benefit all modes

- **Negative**:
  - Mode-specific logic scattered throughout codebase
  - Potential for mode-specific bugs affecting all modes
  - Requires careful conditional logic based on mode

---

## 7. Creator Token Pattern

### Context

Creators need privileged operations (moderation, board settings, export) that regular participants cannot perform. However, creators may not always be authenticated via SSO during board sessions.

### Decision

Issue a separate **Creator Token** upon board creation:
- **Scope**: Grants permissions for creator-only operations on a specific board
- **Storage**: Client-side (localStorage/sessionStorage)
- **Usage**: Required for moderation endpoints (clear board, delete any item, export, etc.)
- **Lifecycle**: Persists for board lifetime; can be regenerated by creator if lost

### Rationale

- **Security**: Separate token limits scope of privileges to single board
- **Flexibility**: Creator can perform privileged actions without re-authentication
- **Granularity**: More secure than using userToken (which has broader scope)
- **User Experience**: Creator maintains privileges even if userToken expires

### Consequences

- **Positive**:
  - Fine-grained access control
  - Better security isolation (one board compromised doesn't affect others)
  - Improved UX (no re-authentication needed)

- **Negative**:
  - Additional token to manage
  - Need secure token generation and validation
  - Potential security risk if token is leaked (mitigated by board-scoping)

---

## 8. REST API with WebSocket Hybrid

### Context

The application needs both transactional operations (create, update, delete) and real-time synchronization. Different operations have different latency and reliability requirements.

### Decision

Use a hybrid approach:
- **REST API**: All CRUD operations (create board, add item, update item, delete)
- **WebSocket**: Real-time state synchronization (cursor positions, presence, live updates)
- **Operation Flow**: Client performs REST mutation → Server broadcasts update via WebSocket

### Rationale

- **REST Benefits**: 
  - Standard HTTP semantics
  - Reliable request/response pattern
  - Easy caching and error handling
  - Familiar to developers
- **WebSocket Benefits**:
  - Low latency for real-time updates
  - Efficient bidirectional communication
  - Supports presence and cursor tracking
- **Separation of Concerns**: Mutations are transactional (REST); synchronization is event-driven (WS)

### Consequences

- **Positive**:
  - Best of both worlds (reliability + real-time)
  - Clear responsibility boundaries
  - Leverages strengths of each protocol

- **Negative**:
  - Two communication channels to manage
  - Potential state inconsistencies if WS fails
  - More complex client implementation
  - Need to handle REST → WS synchronization

---

## 9. SSO-Only User Registration

### Context

Users must be registered to create boards and access premium features. Traditional email/password registration creates friction and requires email verification, password management, etc.

### Decision

Implement **SSO-only registration** using Google and GitHub OAuth:
- **No Email/Password**: Users cannot create accounts with email/password
- **Automatic Registration**: First SSO login automatically creates user account
- **Provider Linking**: Users can potentially link multiple SSO providers to one account

### Rationale

- **Reduced Friction**: No password creation or email verification needed
- **Security**: Leverages OAuth providers' security (2FA, account recovery, etc.)
- **User Experience**: One-click login with familiar providers
- **Maintenance**: No password storage, hashing, or reset flows required

### Consequences

- **Positive**:
  - Faster user onboarding
  - Better security (no password breaches)
  - Less code to maintain (no password management)
  - Higher user trust (using known providers)

- **Negative**:
  - Dependency on OAuth providers (availability, policy changes)
  - Requires OAuth implementation and credential management
  - Users must have Google/GitHub accounts (limits user base)
  - Potential account linking complexity if users have multiple providers

---

## 10. Dashboard Persistence Strategy

### Context

Registered users need to see boards they've created and participated in on their dashboard for easy access. However, participants can join without registration.

### Decision

Implement persistent dashboard tracking via **BoardParticipation** entity:
- **Created Boards**: Always visible to creator (via `ownerUserId`)
- **Participated Boards**: Tracked via `BoardParticipation` when registered user joins any board
- **Both Visible**: Dashboard shows both created and participated boards
- **Anonymous Participants**: Not tracked (no dashboard entry)

### Rationale

- **User Value**: Dashboard provides convenient access to boards user cares about
- **Flexibility**: Users can participate anonymously or register to persist access
- **Progressive Engagement**: Encourages registration by providing value (dashboard)
- **Data Efficiency**: Only tracks registered user participation

### Consequences

- **Positive**:
  - Improves user retention
  - Provides clear value for registration
  - Enables user to find boards they care about

- **Negative**:
  - Additional data model complexity
  - Requires tracking logic on board join
  - Dashboard query complexity (union of created + participated)

---

## Additional Architectural Patterns

### Rate Limiting

- **Board Creation**: 10 per hour per IP
- **Join Requests**: 20 per hour per IP
- **Item Operations**: 100 per minute per participant
- **WebSocket Connections**: 5 concurrent per IP
- **Export Requests**: 10 per hour per board

**Rationale**: Prevents abuse, ensures fair resource usage, protects against DDoS.

### Board Capacity Limits

- **Participants**: Maximum 50 per board
- **Items**: Maximum 500 per board

**Rationale**: Ensures performance (<3 second load time, <1 second update latency) and prevents resource exhaustion.

### Key Generation Algorithm

- 6 alphanumeric characters
- Excludes ambiguous characters (0, O, 1, I, l)
- Ensures pronounceability for easy verbal sharing
- Cryptographically random to prevent guessing

### Anonymous Mode

- **Optional Feature**: Creator can toggle anonymity on/off
- **Effect**: Hides `authorName` from participants (creator can still see)
- **Use Case**: Encourages honest feedback in retrospectives

**Rationale**: Supports use cases requiring anonymity (retrospectives, sensitive feedback) while maintaining moderation capability.

---

## Technology Stack Implications

Based on the architectural decisions:

### Frontend
- **React**: Component-based UI for board rendering
- **WebSocket Client**: Real-time state synchronization
- **State Management**: Needs to handle both REST and WebSocket updates

### Backend
- **REST API**: HTTP server (Express/Node.js based on existing codebase)
- **WebSocket Server**: Real-time event broadcasting
- **Database**: Relational or document store supporting:
  - Users, Boards, Participants, Items, Votes, Columns
  - Complex queries (dashboard, board state)
  - Transactional operations

### Infrastructure
- **Connection Management**: WebSocket connection pooling and scaling
- **Scheduled Jobs**: Board expiration and cleanup
- **Email Service**: Invitation delivery (for private boards)
- **OAuth Integration**: Google and GitHub SSO providers

---

## Future Considerations

### Potential Evolutions

1. **Offline Support**: Offline-first editing with sync when online
2. **Additional Board Modes**: Timeline, Gantt, custom modes
3. **Team Workspaces**: Organization-level board management
4. **Advanced Permissions**: Role-based access control (beyond creator/participant)
5. **Analytics Dashboard**: Board usage and engagement metrics
6. **Export Formats**: PDF, CSV, additional formats beyond PNG and TXT

### Scalability Considerations

- **Horizontal Scaling**: WebSocket connections may require sticky sessions or shared pub/sub
- **Database Scaling**: Board state queries need efficient indexing
- **Real-Time Infrastructure**: Consider message queue (Redis, RabbitMQ) for WebSocket scaling
- **CDN**: Static assets and export generation caching

---

## Decision Log

| Date | Decision | Status |
|------|----------|--------|
| 2026-01-16 | Initial architecture decisions documented | Accepted |

---

*This document is living and should be updated as architectural decisions evolve.*
