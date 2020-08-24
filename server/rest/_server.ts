import { text } from 'body-parser';
import express from 'express';

export const server = express.Router();

server.use(text({ type: 'application/json' }));
