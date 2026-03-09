# ScholarQuest

A Duolingo-style learning platform for any school subject. Upload a syllabus, textbook chapter, or study notes; the app uses the Anthropic Claude API to generate a structured course with levels and quiz questions. No energy or lives—all levels are always playable.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Anthropic Claude API** (`claude-sonnet-4-20250514`) for content parsing and question generation
- **Framer Motion** for animations
- **react-dropzone** for file uploads
- **pdf-parse** (server) and **mammoth** for PDF and .docx text extraction

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and set your Anthropic API key:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   ```
   ANTHROPIC_API_KEY=your_key_here
   ```

   Get a key at [console.anthropic.com](https://console.anthropic.com/).

3. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Features

- **Home (/)** — Upload PDF, .docx, or .txt, or paste text. Enter a subject name and create a course. Loading states while extracting text and generating the course.
- **Course map (/course/[id])** — Duolingo-style path of levels by unit. Progress bar at the top. All levels unlocked (no energy system). Click a level to start the lesson.
- **Lesson (/course/[id]/lesson/[levelId])** — 5–10 questions per level (multiple choice, true/false, fill-in-the-blank). Immediate feedback, XP on correct answers, completion screen with “Continue” back to the map.

## Data

Courses and progress are stored in **localStorage** (no backend or auth for the MVP). Generated questions are cached per level so they are not regenerated on revisit.

## API Routes

- `POST /api/extract` — FormData with `file`; returns `{ text }`.
- `POST /api/generate-course` — JSON `{ subject, text }`; returns Claude course structure.
- `POST /api/generate-questions` — JSON `{ levelTitle, keyTopics, sourceText }`; returns `{ questions }`.

All Claude calls use retry logic for rate limits.

## Design

- **Colors:** Navy background (`#0F1B2D`), teal primary (`#00D4AA`), amber for XP (`#FFB347`).
- **Fonts:** Nunito (headings), DM Sans (body), via Next.js Google Fonts.

## Build

```bash
npm run build
npm start
```
