import http from "http";
import express from "express";
import { matchRouter } from "./routes/matches.js";
import { attachWebsocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get("/", (req, res) => {
	res.json({ msg: "Hello World" });
});

app.use(securityMiddleware);
app.use("/matches", matchRouter);

const { broadcastMatchCreated } = attachWebsocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
	const baseUrl = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

	console.log(`Server is running on baseUrl : ${baseUrl}`);
	console.log(`Websocket Server running on URL: ${baseUrl.replace("http", "ws")}/ws`);
});
8