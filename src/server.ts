import app from "./app";
import prisma from "./prisma/client";
import { env } from "./utils/env";

async function start() {
  try {
    await prisma.$connect();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();