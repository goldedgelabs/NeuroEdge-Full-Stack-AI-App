// backend-ts/src/server.ts
import express from 'express';
import http from 'http';
import chatRouter from './routes/chat';
import uploadsRouter from './routes/uploads';
import { setupWebsocket } from './ws';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(uploadsRouter); // /api/uploads
app.use(chatRouter);    // /api/chat/send

const server = http.createServer(app);
setupWebsocket(server);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(port, () => console.log(`TS backend listening on ${port}`));
