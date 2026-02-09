import z from "zod";

// Match status constant
export const MATCH_STATUS = Object.freeze({
	SCHEDULED: "scheduled",
	LIVE: "live",
	FINISHED: "finished",
});

// Schema for listing matches query params
export const listMatchesQuerySchema = z.object({ limit: z.coerce.number().int().positive().max(100).optional() });

// Schema for match ID params
export const matchIdParamSchema = z.object({
	id: z.coerce.number().int().positive(),
});

// Schema for creating a match
export const createMatchSchema = z
	.object({
		sport: z.string().min(1, "Sport is required"),
		homeTeam: z.string().min(1, "Home team is required"),
		awayTeam: z.string().min(1, "Away team is required"),
		startTime: z.iso.datetime(),
		endTime: z.iso.datetime(),
		homeScore: z.coerce.number().int().nonnegative().optional(),
		awayScore: z.coerce.number().int().nonnegative().optional(),
	})
	.superRefine((data, ctx) => {
		if (new Date(data.endTime) <= new Date(data.startTime)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["endTime"],
				message: "endTime must be after startTime",
			});
		}
	});

export const updateScoreSchema = z.object({
	homeScore: z.coerce.number().int().nonnegative(),
	awayScore: z.coerce.number().int().nonnegative(),
});
