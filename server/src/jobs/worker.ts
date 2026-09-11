import "../config/env";

import { connectDatabase } from "../config/database";

import "./github-sync.worker";

async function startWorker() {
  try {
    await connectDatabase();

    console.log("GitPulse background worker started.");
  } catch (error) {
    console.error("Failed to start worker:", error);

    process.exit(1);
  }
}

startWorker();
