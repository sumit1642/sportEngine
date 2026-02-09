import { Router } from "express";
import { createMatchSchema } from "../validation/matches.js";
import { matches } from "../db/schema.js";
import { db } from "../db/db.js";
import { getMatchStatus } from "../utils/match_status.js";

export const matchRouter = Router();

matchRouter.get("/", (req, res) => {
	res.status(200).json({ msg: "Matches Home Route" });
});

matchRouter.post("/", async (req, res) => {
	const parsed = createMatchSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({ error: "Invalid Payload", details: JSON.stringify(parsed.error.issues) });
	}

	const startDate = new Date(parsed.data.startTime);
	const endDate = new Date(parsed.data.endTime);

	try {
		const [event] = await db
			.insert(matches)
			.values({
				...parsed.data,
				startTime: startDate,
				endTime: endDate,
				homeScore: Number(parsed.data.homeScore ?? 0) || 0,
				awayScore: Number(parsed.data.awayScore ?? 0) || 0,
				status: getMatchStatus(startDate, endDate),
			})
			.returning();

		res.status(201).json({ data: event });
	} catch (error) {
		res.status(500).json({ error: " Failed to create Match", details: JSON.stringify(error) });
	}
});
