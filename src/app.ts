import express from "express";
import cors from "cors";

import routes from "./routes";

const app = express();

const allowedOrigins = new Set<string>([
  "https://facebook-messenger-demo.vercel.app",
  "https://facebook-messenger-demo-e1pn.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
]);
const vercelPreviewOrigin = /^https:\/\/facebook-messenger-demo-[a-z0-9-]+\.vercel\.app$/i;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || vercelPreviewOrigin.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Messenger API running" });
});

app.use("/api", routes);

export default app;
