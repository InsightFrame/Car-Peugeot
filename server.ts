import express from "express";
import { createServer as createViteServer } from "vite";
import fetch from "node-fetch";

const TRONITY_CONFIG = {
  clientId: '7b9402b1-be81-4578-b5d0-96fa5d733e94',
  clientSecret: '19b7995a-f027-44bc-8a92-c9e8b28063b2',
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy for Tronity Auth
  app.post("/api/tronity/token", async (req, res) => {
    try {
      const response = await fetch('https://api.tronity.io/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...req.body,
          client_id: TRONITY_CONFIG.clientId,
          client_secret: TRONITY_CONFIG.clientSecret,
        })
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy Auth Error:", error);
      res.status(500).json({ error: "Failed to authenticate with Tronity" });
    }
  });

  // API Proxy for Tronity Data
  app.get("/api/tronity/*", async (req, res) => {
    const path = req.params[0];
    const authHeader = req.headers.authorization;

    try {
      const response = await fetch(`https://api.tronity.io/v1/${path}`, {
        headers: { 
          'Authorization': authHeader || '',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy Data Error:", error);
      res.status(500).json({ error: "Failed to fetch data from Tronity" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
