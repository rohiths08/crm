# AI CRM Importer

An intelligent, production-ready full-stack application that allows users to upload unstructured CSV files and uses Google Gemini AI to automatically map and import them into standardized CRM records.

## Screenshots

### 1. Landing Page
<img width="1861" height="1008" alt="Screenshot From 2026-07-10 11-41-43" src="https://github.com/user-attachments/assets/90e04c31-aea6-48d6-8e3f-59fe80356d3b" />


### 2. CRM Import Results Dashboard 

<img width="1861" height="1008" alt="Screenshot From 2026-07-10 11-41-09" src="https://github.com/user-attachments/assets/cb4968f7-928b-420d-bb9d-900c937e9ff8" />

<img width="1861" height="1008" alt="Screenshot From 2026-07-10 11-41-18" src="https://github.com/user-attachments/assets/d0a8fb20-8695-4474-987c-254880646faf" />


### 3. Recent Upload History (with verified record counts)
<img width="1861" height="1008" alt="image" src="https://github.com/user-attachments/assets/ec6ff0c9-dbca-4489-bf71-adf3cd129f70" />


### 4. Processing 
<img width="1861" height="1008" alt="Screenshot From 2026-07-10 11-32-54" src="https://github.com/user-attachments/assets/a4b5ab7d-d907-454c-863c-d261a0d62bb9" />

## Features

- **AI-Powered Data Extraction:** Uses Gemini to dynamically understand CSV headers and map unstructured data to CRM schemas (Name, Email, Phone, Company, Status, etc.).
- **Production-Grade Backend Resilience:**
  - **Zero-RAM Streaming:** Uses `fs.createReadStream` and `multer.diskStorage` to parse massive CSV files chunk-by-chunk without crashing the V8 memory heap (OOM prevention).
  - **Global Concurrency Limits:** Strict global semaphores (`p-limit`) prevent AI quota exhaustion when multiple users upload files concurrently.
  - **Fault Tolerance:** Built-in exponential backoff gracefully handles API rate limits (HTTP 429) and network blips.
  - **Fail-Fast Validation:** Uses Zod for strict startup configuration checking and field-level `.catch()` repair strategies to salvage partially-hallucinated AI responses.
  - **Security Hardened:** Secured with `helmet` headers and `express-rate-limit`.

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS

### Backend
- Node.js & Express
- Google Gemini AI SDK (`@google/genai`)
- Zod (Type-safe schema validation)
- Pino (Structured logging)
- CSV-Parse (Streaming CSV processing)

## Getting Started

### 1. Start the Backend API

```bash
cd backend
npm install
```

Copy the example environment file and add your Gemini API Key:
```bash
cp .env.example .env
```
Ensure your `.env` has:
```env
PORT=3001
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Start the backend development server:
```bash
npm run dev
```
The API will be available at `http://localhost:3001`.

### 2. Start the Frontend

In a new terminal window, from the root directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Endpoints

- `GET /health` - Returns server health status.
- `POST /api/import` - Upload a CSV file (`multipart/form-data` with `file` key) to run the AI import pipeline.
