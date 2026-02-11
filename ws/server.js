import { WebSocket, WebSocketServer } from "ws";

/**
 * Send a JSON-serializable payload over a WebSocket if the socket is open.
 *
 * @param {WebSocket} socket - The WebSocket to send the payload on.
 * @param {*} payload - The value to serialize and send (must be JSON-serializable).
 */
export function sendJson(socket, payload) {
	if (socket.readyState !== WebSocket.OPEN) return;

	// need to stringify because data coming from the ws is in the form of buffer data.
	socket.send(JSON.stringify(payload));
}
/**
 * Send a JSON-serializable payload to every connected client whose socket is open.
 * @param {WebSocketServer} wss - The WebSocket server whose clients will receive the payload.
 * @param {*} payload - The value to serialize to JSON and send to each open client.
 */
function broadcast(wss, payload) {
	for (const client of wss.clients) {
		if (client.readyState !== WebSocket.OPEN) continue;

		client.send(JSON.stringify(payload));
	}
}
/**
 * Attach a WebSocketServer to an existing HTTP server and provide helpers to broadcast events.
 * @param {import('http').Server} server - The HTTP server instance to bind the WebSocketServer to.
 * @returns {{ broadcastMatchCreated(match: any): void }} An object exposing `broadcastMatchCreated`, which sends a `match_created` message with the given match data to all connected clients.
 */

export function attachWebsocketServer(server) {
	const wss = new WebSocketServer({
		server,
		path: "/ws",
		maxPayload: 1024 * 1024,
	});

	wss.on("connection", (socket) => {
		socket.isAlive = true;
		// Mark the socket as alive when a pong is received
		socket.on("pong", () => {
			socket.isAlive = true;
		});

		sendJson(socket, { type: "welcome" });

		socket.on("error", console.error);
	});

	// Ping clients every 30 seconds to keep connections alive and detect dead connections
	const interval = setInterval(() => {
		wss.clients.forEach((socket) => {
			if (socket.isAlive === false) {
				return socket.terminate();
			}

			socket.isAlive = false;
			socket.ping();
		});
	}, 30000);
	// Clean up the interval when the server closes  otherwise it will keep the Node.js process alive
	wss.on("close", () => {
		clearInterval(interval);
	});

	/**
	 * Broadcast a "match_created" event containing the provided match data to all connected clients.
	 * @param {Object} match - The match object to include in the broadcast payload.
	 */
	function broadcastMatchCreated(match) {
		broadcast(wss, { type: "match_created", data: match });
	}

	return { broadcastMatchCreated };
}
