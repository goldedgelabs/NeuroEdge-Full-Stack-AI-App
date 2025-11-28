import express from "express";
import uploadRouter from "./routes/uploads";
import chatRouter from "./routes/chat";
import { createServer } from "http";
import { setupWebsocket } from "./ws";

const app = express();
app.use(express.json());

app.use(uploadRouter);
app.use(chatRouter);

const httpServer = createServer(app);
setupWebsocket(httpServer);

httpServer.listen(4000, () => console.log("TS backend running on 4000"));
