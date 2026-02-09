import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
import { matches } from "../db/schema.js";
import { db } from "../db/db.js";
import { getMatchStatus } from "../utils/match_status.js";
import { desc } from "drizzle-orm";

export const matchRouter = Router();
const MAX_LIMIT = 100;

matchRouter.get("/", async (req, res) => {
	const parsedData = listMatchesQuerySchema.safeParse(req.query);

	if (!parsedData.success) {
		return res.status(400).json({ error: "Invalid query", details: JSON.stringify(parsedData.error.issues) });
	}

	const limit = Math.min(parsedData.data.limit ?? 50, MAX_LIMIT);

	try {
		const data = await db.select().from(matches).orderBy(desc(matches.createdAt)).limit(limit);
		return res.status(200).json({ data: data });
	} catch (error) {
		return res.status(500).json({ msg: "Failed to list matches", error: error.message });
	}
});

matchRouter.post("/", async (req, res) => {
	const parsedData = createMatchSchema.safeParse(req.body);

	if (!parsedData.success) {
		return res.status(400).json({ error: "Invalid Payload", details: JSON.stringify(parsedData.error.issues) });
	}

	const {
		data: { startTime, endTime, homeScore, awayScore },
	} = parsedData;

	try {
		// .returning() => It returns an array and that's why we are de-strcutring that array, [event]=> gets the value from .returning()
		const [event] = await db
			.insert(matches)
			.values({
				...parsedData.data,
				startTime: new Date(startTime),
				endTime: new Date(endTime),
				homeScore: homeScore ?? 0,
				awayScore: awayScore ?? 0,
				status: getMatchStatus(startTime, endTime),
			})
			.returning();

		res.status(201).json({ data: event });
	} catch (error) {
		res.status(500).json({ error: " Failed to create Match", details: JSON.stringify(error) });
	}
});

