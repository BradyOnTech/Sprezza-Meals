import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getPayload } from 'payload';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

const start = async () => {
  // Ensure env is loaded before importing config (which reads env)
  const { default: payloadConfig } = await import('./payload.config.js');

  const payload = await getPayload({
    config: payloadConfig,
    express: app,
    secret: process.env.PAYLOAD_SECRET || 'change-me'
  });

  const port = Number(process.env.PAYLOAD_PORT) || 4000;
  app.listen(port, () => {
    payload.logger.info(
      `Payload admin running at ${process.env.PAYLOAD_PUBLIC_SERVER_URL || `http://localhost:${port}`}`
    );
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
