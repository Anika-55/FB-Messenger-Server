import express from "express";
import cors from "cors";

import routes from "./routes";

const app = express();

const allowedOrigins = new Set<string>([
  "https://facebook-messenger-demo.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Messenger API running" });
});

app.use("/api", routes);

export default app;
