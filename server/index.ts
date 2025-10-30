import "dotenv/config";

import cors from "cors";
import express from "express";
import { ZodError } from "zod";

import DataStore from "./lib/datastore";
import createAnalyticsRouter from "./routes/analytics";
import createBotsRouter from "./routes/bots";

const app = express();
const port = Number(process.env.PORT ?? 4000);

const clientOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : undefined;

app.use(
  cors({
    origin: clientOrigins && clientOrigins.length ? clientOrigins : true,
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

const store = new DataStore();

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/bots", createBotsRouter(store));
app.use("/api/analytics", createAnalyticsRouter(store));

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  if (error instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", details: error.flatten() });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`BuildMyBot API listening on http://localhost:${port}`);
});
