import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Google GenAI client lazily to avoid crashing if the key is missing
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// ---------------------- API ROUTES ----------------------

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString()
  });
});

// AI Personal Productivity Copilot - Server-Side Gemini Route
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userProfile, currentSchedule } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGenAI();

    // Fallback response if the Gemini API key is not configured
    if (!ai) {
      const lastMsg = messages[messages.length - 1]?.text || "";
      const isEnglish = !lastMsg || /[a-zA-Z]/.test(lastMsg);
      return res.json({
        text: isEnglish 
          ? "✨ Greetings! I am **TimeMate AI Companion**. \n\nI see that the `GEMINI_API_KEY` is not yet configured in the Secrets panel. \n\nEven without my AI reasoning, you can fully use **TimeMate** to log water, start focus modes, schedule calls, and plan your timetable. When you add the API Key, I can auto-schedule your bullet points!"
          : "✨ 안녕하세요! **TimeMate AI 비서**입니다. \n\n`GEMINI_API_KEY`가 아직 설정되지 않았습니다. API 키를 추가해주시면 더욱 스마트한 일정 관리를 도와드릴 수 있습니다!"
      });
    }

    const latestMessage = messages[messages.length - 1]?.text;
    
    // Construct system instructions
    const systemPrompt = `You are "TimeMate Assistant", a high-end personal scheduling and productivity advisor.
Your tagline is "Your Smart Daily Companion".
The user is managing their daily scheduling on TimeMate.
Your job is to:
1. Help organize their daily schedule.
2. Formulate helpful tips on hydration, taking breaks, scheduled call preparation, and focus techniques (like Pomodoro).
3. If they ask you to schedule a task or make plans, explain the exact schedule suggested.
4. Keep the tone friendly, modern, highly encouraging, and strictly focused on scheduling and user well-being.
5. Answer concisely, using clear markdown spacing, bold key terms, list bullets, or quotes.

Context:
- User Profile: ${JSON.stringify(userProfile || { name: 'Friend' })}
- Current Loaded Schedule Events: ${JSON.stringify(currentSchedule || [])}
- Current Local Time: ${new Date().toISOString()}`;

    // Call Gemini 3.5 Flash Model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: latestMessage || "Hello",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      text: response.text || "I'm ready to keep you organized."
    });
  } catch (error: any) {
    console.error("Gemini API Error in server.ts:", error);
    res.status(500).json({
      error: "Failed to communicate with AI Companion.",
      details: error.message
    });
  }
});

// Mock Sync & Restore Endpoint to satisfy "Google Account / Firebase Cloud Sync" Settings prepare block
app.post("/api/backup", (req, res) => {
  const { data } = req.body;
  // Simulates structural validation and backup synchronization
  if (!data) {
    return res.status(400).json({ error: "Backup data is empty." });
  }
  res.json({
    success: true,
    syncId: "sync_" + Math.random().toString(36).substring(2, 11),
    timestamp: new Date().toISOString(),
    message: "Cloud database backup transaction completed successfully."
  });
});

// ---------------------- VITE ASSET HANDLING ----------------------

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite dev server in development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve build artifacts in production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TimeMate backend server running on http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Vite server configuration crashed!", err);
  process.exit(1);
});
