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
