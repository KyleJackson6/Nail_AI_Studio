# Nail AI Studio

> An AI-driven virtual nail art design and visualization platform powered by the Google Gemini API, enabling users to generate, customize, and preview nail styles in real time.

---

## Overview

Nail AI Studio is a modern web application built to bridge digital beauty design and real-world nail artistry. Built with **Next.js**, **React**, **TypeScript**, and the **Google Gemini API**, the platform allows users to explore dynamic color palettes, tweak textures and finishes, and generate custom styling concepts through an intuitive, responsive interface.

---

## Features

- **Gemini-Powered Style Generation:** Generate unique nail concepts, color palettes, and art recommendations using Google's Gemini multimodal models.
- **BYOK (Bring Your Own Key):** Secure client/environment configuration allowing users to connect their own Gemini API key.
- **Real-Time Visualization:** Interactively preview colors, textures, and finishes (matte, gloss, chrome, accents).
- **Responsive Studio UI:** High-performance, mobile-first design built with modern React paradigms.
- **Design Export:** Save customized palettes and generate styling references ready for salon appointments.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Frontend & Language:** React, TypeScript, Tailwind CSS
- **AI Engine:** Google Gemini API (`@google/genai` / `@google/generative-ai`)
- **Icons & UI Assets:** Lucide React
- **Deployment:** Vercel

---

## Getting Started

### Prerequisites

Ensure you have the following installed and set up:
- **Node.js:** 18.17 or later
- **Package Manager:** npm, yarn, pnpm, or bun
- **Google Gemini API Key:** Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/KyleJackson6/Nail_AI_Studio.git](https://github.com/KyleJackson6/Nail_AI_Studio.git)
   cd Nail_AI_Studio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: You can also enter or update your API key directly within the app settings interface if configured).*

4. **Run the local development server:**
   ```bash
   npm run dev
   ```

5. **View in browser:**  
   Open [http://localhost:3000](http://localhost:3000) to start designing.

---

## Roadmap & Future Enhancements

- Real-time hand and nail landmark detection via MediaPipe for live camera virtual try-on.
- WebGL / Three.js 3D hand rendering for accurate lighting and reflection previews.
- Community gallery for users to publish and rate custom nail sets.

---

## Author

Kyle Jackson  
- **GitHub:** [@KyleJackson6](https://github.com/KyleJackson6)  
- **LinkedIn:** [Kyle Jackson](https://www.linkedin.com/in/kyle-jackson-1006a52b4)
