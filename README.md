# Auto-Mapping Assistant :

A full-stack AI-powered tool that automates the mapping of uploaded CSV files to internal CRM schemas even when headers are multilingual or inconsistently named.

# Watch Live demo

## Features :

- Auto-maps CSV headers to internal CRM fields
- Supports multilingual headers (e.g., French, Arabic)
- Uses Ollama (LLaMA2) for semantic AI mapping
- Smart caching to avoid redundant AI calls
- Sample data preview and manual override
- Progress bar and import confirmation
- Token-based authentication

## Tech Stack

| Layer        | Technology                     |
| ------------ | ------------------------------ |
| Frontend     | Next.js (React)                |
| Backend      | Express.js (Node)              |
| Database     | MongoDB                        |
| Styling      | Tailwind CSS                   |
| AI Engine    | Ollama (LLaMA2) or any LLM API |
| File Uploads | Multer + CSV Parser            |

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed
- MongoDB running locally
- Ollama or any LLM API

### 1. Clone the repository

- git clone https://github.com/souf21/Auto-Mapping-Assistant.git

- cd Auto-Mapping-Assistant

### 2. AI setup

This project uses [Ollama](https://ollama.com) to run LLaMA2 locally.

IN TERMINAL :

- ollama pull llama2:7b

- ollama run llama2:7b

### 3. Environment variables

In backend(backend/.env) :

- PORT=5000

- MONGO_URI=mongodb://localhost:27017/mapping-assistant

- JWT_SECRET=your_jwt_secret

- API_URL=http://localhost:11434

In frontend(frontend/brand/.env.local):

- NEXT_PUBLIC_API_URL=http://localhost:5000

### 4. Start the app

- docker-compose up --build

### 5. How It Works

1. **Upload Phase**: User uploads a file (csv, JSON, tsv...) → backend parse it, extracts headers and sample rows.
2. **Auto-Mapping Phase**: Exact matches are attempted → AI fills in missing fields using LLaMA2.
3. **Review & Import**: User reviews mappings, previews data, and confirms import.

### 6. About

This project solves a real-world data onboarding challenge using AI and modern web technologies.
