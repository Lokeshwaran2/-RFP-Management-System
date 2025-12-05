# AI-Powered RFP Management System

An end-to-end solution for managing Requests for Proposals (RFPs) using AI to automate creation, parsing, and comparison.

## Features
-   **AI-Powered RFP Creation**: Convert natural language requests into structured RFPs.
-   **Vendor Management**: Manage vendor contacts and send RFPs via email.
-   **Email Ingestion**: Automatically fetch and parse vendor proposals from emails.
-   **AI Comparison**: Compare multiple proposals with weighted scoring and recommendations.
-   **Dashboard**: Centralized view of all procurement activities.

## Tech Stack
-   **Frontend**: Next.js 14, Tailwind CSS, Zustand, Lucide React.
-   **Backend**: Node.js, Express, MongoDB, Mongoose.
-   **AI**: OpenAI GPT-4o.
-   **Email**: Nodemailer (SMTP), imap-simple (IMAP).

## Prerequisites
-   Node.js v18+
-   MongoDB (Local or Atlas)
-   OpenAI API Key
-   Email Account (Gmail or Ethereal for testing)

## Installation

### 1. Clone & Setup
```bash
git clone <repo-url>
cd rfp-system
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Seed Data
The application starts with an empty database. You can create data manually via the UI or use the provided demo script logic.
- **Vendors**: Add vendors in the "Vendor Management" tab.
- **RFPs**: Create new RFPs via the chat interface.

## Configuration (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rfp-system
OPENAI_API_KEY=sk-...
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
IMAP_HOST=imap.gmail.com
```

## Usage Guide

1.  **Create RFP**: Go to "Create RFP" and type "I need 50 MacBooks for the design team."
2.  **Add Vendors**: Go to "Vendor Management" and add vendors.
3.  **Send RFP**: Open the created RFP and select vendors to email.
4.  **Receive Proposals**: Vendors reply to the email. The system ingests these (via webhook or polling).
5.  **Compare**: Click "Compare Proposals" to see the AI analysis.

## API Documentation
### 1. Create RFP
- **Endpoint**: `POST /api/rfp/create`
- **Body**: `{ "content": "I need 50 laptops...", "title": "Laptop Procurement" }`
- **Success (201)**: `{ "_id": "...", "structuredData": { ... } }`

### 2. Get RFP Details
- **Endpoint**: `GET /api/rfp/:id`
- **Success (200)**: Returns full RFP object including vendors and status.

### 3. Send Emails
- **Endpoint**: `POST /api/rfp/:id/send-emails`
- **Body**: `{ "vendorIds": ["v1", "v2"] }`
- **Success (200)**: `{ "message": "Emails sent", "results": [...] }`

### 4. Ingest Emails
- **Endpoint**: `POST /api/email/ingest`
- **Body**: `{ "rfpId": "..." }` (Optional, defaults to checking all)
- **Success (200)**: `{ "message": "Processed 2 emails", "proposals": [...] }`

### 5. Compare Proposals
- **Endpoint**: `POST /api/rfp/:id/compare`
- **Success (200)**: Returns JSON with `comparison_matrix`, `recommendation`, and `justification`.

## Decisions & Assumptions
### Key Design Decisions
-   **Architecture**: 3-tier architecture (Next.js, Node.js, MongoDB) for separation of concerns and scalability.
-   **AI Integration**: Used a service-layer approach (`AIService`) to abstract AI logic, allowing easy switching between providers (OpenAI/Groq).
-   **Email Handling**: Implemented a dual-mode system (Real/Mock) to ensure the application is testable even without valid credentials.
-   **Mock Fallback**: Critical decision to implement robust fallback logic. If API keys or Quotas fail, the system gracefully degrades to "Mock Mode" to preserve the user experience during demos.

### Assumptions
-   **Email Format**: Vendors reply to the specific email thread or include the `Ref:ID` in the subject line for tracking.
-   **Single User**: The system is designed for a single procurement manager, so complex role-based access control was out of scope.
-   **Data Volume**: Assumed a reasonable volume of RFPs where polling for emails is sufficient for the demo.

## AI Tools Usage
-   **Tools Used**: GitHub Copilot, ChatGPT (GPT-4o).
-   **Usage**:
    -   **Boilerplate**: Rapidly scaffolding the Express backend and Next.js frontend structures.
    -   **Debugging**: Diagnosing the "Insufficient Quota" error and suggesting the Mock Fallback strategy.
    -   **Design**: Refining the data models for `RFP` and `Proposal` to ensure they captured necessary fields like `line_items` and `warranty`.
    -   **Prompt Engineering**: Crafting the system prompts to ensure the AI returns strictly valid JSON for the application to parse.
    -   **Learnings**:
        -   **Rate Limits**: Discovered the importance of caching and model selection (switching to `8b-instant`) to avoid 429 errors during development.
        -   **Context Matters**: Learned that passing both structured data AND raw text to the AI improves the accuracy of proposal comparisons significantly.

## Future Improvements
-   Real-time email webhooks (SendGrid/Mailgun).
-   PDF attachment parsing (currently parses email body).
-   User authentication & role-based access.
