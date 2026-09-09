const dns = require("dns");
dns.setServers(["172.18.0.26"]);

import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`GitPulse API running on http://localhost:${env.port}`);
  });
};

startServer();
