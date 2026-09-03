import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", liveSupported: true });
  });

  // Text-based fallback / packing advice endpoint
  app.post("/api/assistant/advice", async (req, res) => {
    try {
      const { prompt, tripContext } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is required" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const systemPrompt = `You are PackSwipe AI, an expert travel assistant. Provide quick, punchy, bulleted advice or item recommendations for packing. Keep responses under 100 words. Trip: ${JSON.stringify(
        tripContext || {}
      )}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `${systemPrompt}\n\nUser request: ${prompt}`,
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Advice API error:", err);
      res.status(500).json({ error: err?.message || "Failed to generate advice" });
    }
  });

  // WebSocket Server for Live API Voice Conversations
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host}`);
    if (url.pathname === "/api/live-ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", async (clientWs: WebSocket) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      clientWs.send(
        JSON.stringify({
          type: "error",
          error: "GEMINI_API_KEY environment variable is required for Live Voice API.",
        })
      );
      clientWs.close();
      return;
    }

    let session: any = null;

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction:
            "You are PackSwipe AI, a quick, witty, expert travel companion. Help the traveler decide what to pack or skip, give genius fold hacks and carry-on weight advice, and keep spoken answers brief, lively, and warm.",
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio =
              message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "audio", audio }));
            }
            if (
              message.serverContent?.interrupted &&
              clientWs.readyState === WebSocket.OPEN
            ) {
              clientWs.send(JSON.stringify({ type: "interrupted" }));
            }
            if (
              message.serverContent?.turnComplete &&
              clientWs.readyState === WebSocket.OPEN
            ) {
              clientWs.send(JSON.stringify({ type: "turnComplete" }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.close();
            }
          },
          onerror: (err: any) => {
            console.error("Gemini Live session error:", err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: "error",
                  error: err?.message || "Voice session encountered an error",
                })
              );
            }
          },
        },
      });

      clientWs.send(JSON.stringify({ type: "connected" }));

      clientWs.on("message", (data: any) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === "audio" && msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
            });
          } else if (msg.type === "text" && msg.text) {
            session.sendRealtimeInput({
              text: msg.text,
            });
          }
        } catch (e) {
          console.error("Error handling client message:", e);
        }
      });

      clientWs.on("close", () => {
        try {
          session?.close();
        } catch (err) {
          // ignore cleanup error
        }
      });
    } catch (error: any) {
      console.error("Failed to connect to Gemini Live:", error);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: "error",
            error: error?.message || "Failed to initialize Gemini Live voice session.",
          })
        );
        clientWs.close();
      }
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`PackSwipe server with Gemini Live running on http://localhost:${PORT}`);
  });
}

startServer();
