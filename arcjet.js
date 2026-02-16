import { baseUrl } from "@arcjet/env";
import arcjet, { detectBot, shield, slidingWindow, createRemoteClient } from "@arcjet/node";

const ARCJET_KEY = process.env.ARCJET_KEY;
if (!ARCJET_KEY) throw new Error("Missing ARCJET_KEY environment variable");

const ARCJET_MODE = process.env.ARCJET_MODE === "DRY_RUN" ? "DRY_RUN" : "LIVE";

const client = createRemoteClient({
	baseUrl: baseUrl(process.env),
	timeout: 1000,
});

export const httpArcjet =
	ARCJET_KEY ?
		arcjet({
			key: ARCJET_KEY,
			rules: [
				shield({ mode: ARCJET_MODE }),
				detectBot({ mode: ARCJET_MODE, allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"] }),
				slidingWindow({ mode: ARCJET_MODE, interval: "10s", max: 50 }),
			],
			client,
		})
	:	null;

export const wsArcjet =
	ARCJET_KEY ?
		arcjet({
			key: ARCJET_KEY,
			rules: [
				shield({ mode: ARCJET_MODE }),
				detectBot({ mode: ARCJET_MODE, allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"] }),
				slidingWindow({ mode: ARCJET_MODE, interval: "2s", max: 50 }),
			],
			client,
		})
	:	null;

export const securityMiddleware = async (req, res, next) => {
	if (!httpArcjet) {
		return next();
	}

	try {
		const decision = await httpArcjet.protect(req);
		if (decision.isDenied()) {
			if (decision.reason.isRateLimit()) {
				return res.status(429).json({ error: "Too Many Requests" });
			}
			return res.status(403).json({ error: "Forbidden" });
		}
	} catch (error) {
		console.error("Error in Arcjet middleware:", error);
		return res.status(503).json({ error: "Service Unavailable" });
	}
	next();
};
