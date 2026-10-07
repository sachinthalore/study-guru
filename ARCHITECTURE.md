# Study Guru — System Architecture

## 1. Overview

Study Guru is a Node.js/Express backend for an AI-assisted study platform. The backend is organized around HTTP routes, security/validation middleware, controllers, services, models, and integrations with MongoDB, Gemini, Cloudinary, and email services.

The main architectural flow is:

```text
Client
  ↓
Express Application
  ↓
Security / Validation Middleware
  ↓
Routes
  ↓
Controllers
  ↓
Services
  ↓
Models / External Services
  ↓
MongoDB / Gemini / Cloudinary / Email
```

The implementation uses ES modules and Express 5. The application entry point is `server.js`, while `server/app.js` configures middleware and routes.

## 2. Application Layer

### Entry point

`server.js` starts the backend and delegates application configuration to `server/app.js`.

### Express application

`server/app.js` configures:

- JSON request parsing
- Cookie parsing
- Response compression
- Morgan request logging connected to Winston
- CORS
- Helmet security headers / CSP
- Global rate limiting
- API route mounting
- 404 handling
- Central error handling

API routes are mounted under `/api/v1` where applicable.

## 3. Layered Architecture

### Routes

Routes define HTTP endpoints and compose middleware with controller handlers.

Examples:

- `auth.routes.js`
- `document.routes.js`
- `v1/chat.routes.js`
- `note.routes.js`
- `quiz.routes.js`
- `flashcard.routes.js`
- `analytics.routes.js`
- `studySession.routes.js`
- `admin.routes.js`

### Middleware

Middleware handles cross-cutting concerns before business logic reaches controllers.

Key middleware includes:

- `auth.middleware.js` — access-token authentication and role authorization
- `rateLimit.middleware.js` — endpoint-specific rate limits
- `validate.middleware.js` — request validation integration
- `upload.middleware.js` — multipart upload handling and size/type restrictions
- `file-security.middleware.js` — uploaded-file content/security validation
- `error.middleware.js` — centralized error response handling

### Controllers

Controllers translate HTTP requests into service calls and HTTP responses. They are intended to remain thin and keep business logic in services.

### Services

Services contain domain/business logic and orchestration. The project separates major domains into dedicated services and further isolates AI, extraction, and RAG responsibilities.

### Models

Mongoose models represent persisted application data such as users, documents, document chunks, chats, notes, quizzes, flashcards, analytics, and study sessions.

## 4. Core Modules

### Authentication

```text
Auth Route
  ↓
Validation / Rate Limit
  ↓
Auth Controller
  ↓
Auth / Password / Token / Verification Services
  ↓
User Model
  ↓
MongoDB
```

Authentication includes registration, login, token handling, password-related flows, and verification-related services. Protected requests use the authentication middleware, which verifies the access token and loads the current user.

### Documents

```text
Document Upload
  ↓
Authentication + Upload Middleware + File Security
  ↓
Document Controller
  ↓
Document Service
  ├── Cloudinary upload
  ├── Text extraction
  ├── RAG chunk creation
  ├── Embedding generation/storage
  └── AI generation
       ├── Summary
       ├── Notes
       ├── Quiz
       ├── Flashcards
       └── Mind Map
  ↓
MongoDB
```

The document service records processing status and AI-processing status. AI failures can result in a `partial` processing state rather than making the complete document record unusable.

### Chat

General chat follows:

```text
Chat Route
  ↓
Authentication / AI Rate Limit / Validation
  ↓
Chat Controller
  ↓
Chat Service
  ↓
Gemini
  ↓
Chat Model / MongoDB
```

Chat history is persisted in MongoDB.

### RAG

Document-grounded questions use a separate retrieval flow:

```text
User Question
  ↓
RAG Answer Service
  ↓
Verify Document Ownership
  ↓
Query Embedding
  ↓
Relevant Chunk Retrieval
  ↓
Context Construction
  ↓
Gemini
  ↓
Answer + Sources
```

The current RAG answer service validates the document ID, verifies that the document belongs to the authenticated user, retrieves up to five relevant chunks, constructs a context-only prompt, and returns the generated answer with chunk source metadata.

### AI Services

AI functionality is separated under `server/services/ai/`:

- Summary generation
- Notes generation
- Quiz generation
- Flashcard generation
- Mind-map generation
- Document AI reprocessing

Gemini calls are centralized through the configured Gemini client and retry/quota handling utility.

### Extraction Services

Document text extraction is separated by format under `server/services/extraction/`.

The extraction layer includes services for formats such as PDF, DOC/DOCX, PPT/PPTX, spreadsheets, plain text/Markdown, and images.

### RAG Services

RAG responsibilities are separated under `server/services/rag/`:

- Chunking
- Chunk storage
- Embedding generation
- Embedding storage
- Query embeddings
- Retrieval
- RAG answer generation

### Notes

```text
Note Route
  ↓
Authentication + Validation
  ↓
Note Controller
  ↓
Note Service
  ↓
Note Model
  ↓
MongoDB
```

### Quiz

Quiz generation is performed by the AI quiz service. Quiz management and result handling are handled by the quiz service/controller layer.

```text
Document Content
  ↓
AI Quiz Service
  ↓
Gemini
  ↓
Generated Questions
  ↓
Quiz Service / Quiz Model
  ↓
MongoDB
```

Quiz submission calculates the result server-side rather than trusting a client-provided score.

### Flashcards

```text
Document Content
  ↓
AI Flashcard Service
  ↓
Gemini
  ↓
Flashcard Data
  ↓
Flashcard Service / Model
  ↓
MongoDB
```

The flashcard model also supports study/review state such as mastery, review count, difficulty, and last-reviewed information.

### Analytics

Analytics aggregates user activity across the application's data sources.

```text
Documents ─┐
Quizzes   ─┤
Notes     ─┤
Flashcards─┤
Chats     ─┤ → Analytics Service → Analytics Model / MongoDB
Sessions  ─┘
```

The analytics service combines application activity into dashboard-oriented statistics.

### Study Sessions

```text
Study Session Route
  ↓
Authentication + Validation
  ↓
Study Session Controller
  ↓
Study Session Service
  ↓
Study Session Model
  ↓
MongoDB
```

A session may be associated with a document and tracks start/end information, duration, and study activity. Ownership checks are applied when a document is associated with a session.

### Admin

The admin API is protected by authentication and admin-role authorization, with an additional admin rate limiter.

```text
Admin Route
  ↓
Authenticate
  ↓
Authorize(admin)
  ↓
Admin Rate Limit
  ↓
Admin Controller
  ↓
MongoDB Models
```

The current implementation has admin controller logic that accesses models directly for admin operations. This is an architectural inconsistency compared with the service-oriented modules and is a documented future refactoring opportunity, not an assumed completed service layer.

## 5. Security Architecture

Security is implemented as multiple layers rather than a single control.

```text
Request
  ↓
CORS
  ↓
Helmet / CSP
  ↓
Rate Limiting
  ↓
Authentication
  ↓
Authorization
  ↓
Input Validation
  ↓
File Security (when applicable)
  ↓
Business Logic
```

The document upload path additionally validates uploaded file content rather than relying only on client-provided MIME information.

Protected resources use ownership checks where applicable. JWT verification is configured for the expected signing algorithm.

## 6. Data Architecture

The principal persistence models are:

```text
User
Document
DocumentChunk
Chat
Note
Quiz
Flashcard
Analytics
StudySession
```

Documents and their chunks form the foundation of the document intelligence/RAG workflow.

## 7. External Integrations

### MongoDB / Mongoose

Primary persistence layer for users, study content, conversations, RAG chunks/embeddings, analytics, and sessions.

### Google Gemini

Used for AI generation and embedding-related workflows through the configured Gemini client.

### Cloudinary

Used for uploaded document asset storage. Document records retain the Cloudinary URL/public ID/resource type needed for asset management.

### Email

Email functionality is isolated in `email.service.js` for verification/password-related workflows.

## 8. End-to-End Document Intelligence Flow

```text
                    ┌──────────────┐
                    │    Client    │
                    └──────┬───────┘
                           │
                           ▼
                    Document Upload
                           │
                           ▼
                 Security + Validation
                           │
                           ▼
                  Document Controller
                           │
                           ▼
                   Document Service
                     /           \
                    /             \
                   ▼               ▼
             Cloudinary       Text Extraction
                                   │
                                   ▼
                                Chunking
                                   │
                                   ▼
                              Embeddings
                                   │
                                   ▼
                              MongoDB
                                   │
                ┌──────────────────┼──────────────────┐
                ▼                  ▼                  ▼
             Summary             Quiz            Flashcards
                │                  │                  │
                └──────────────────┼──────────────────┘
                                   ▼
                                Gemini
```

## 9. End-to-End RAG Flow

```text
Question
   ↓
Authentication
   ↓
Document Ownership Check
   ↓
Query Embedding
   ↓
Vector Retrieval
   ↓
Relevant Document Chunks
   ↓
Context-only Prompt
   ↓
Gemini
   ↓
Grounded Answer + Sources
```

The RAG prompt explicitly instructs the model to use only supplied document context, avoid outside knowledge, avoid invented facts, and state when the information is not present in the document.

## 10. Architectural Strengths

- Clear separation between routes, middleware, controllers, and services.
- Dedicated AI, extraction, and RAG service layers.
- Centralized configuration for environment-dependent integrations.
- Authentication and authorization middleware separated from business logic.
- File upload security is handled before document processing.
- Document ownership checks are used in document-grounded workflows.
- AI quota/rate-limit failures are handled explicitly during document processing.
- Centralized error handling and logging are present at the application level.

## 11. Current Architectural Improvement Opportunities

These are observations of the current implementation, not claims that the functionality is missing:

1. **Admin service layer:** admin controller currently accesses models directly. A dedicated `admin.service.js` would make it consistent with the rest of the architecture.
2. **Document processing orchestration:** document upload currently performs extraction, RAG preparation, and multiple AI generations in one service flow. A future background-job/queue architecture could make large document processing more resilient and scalable.
3. **API documentation:** endpoint-level OpenAPI/Swagger documentation can be added as a separate documentation phase.
4. **Automated tests:** a formal unit/integration test suite can be added without changing the production architecture.

## 12. Interview Explanation

> Study Guru follows a layered backend architecture built with Node.js and Express. Routes compose middleware and controllers, middleware handles security, authentication and validation, controllers remain thin, and services contain business logic. The document pipeline is separated into extraction, RAG, and AI services. Documents are stored through Cloudinary, application data is persisted in MongoDB, and Gemini provides AI generation and embedding capabilities. For document-grounded questions, the system verifies ownership, retrieves relevant vectorized chunks, constructs a context-only prompt, and generates a grounded answer with source metadata.
