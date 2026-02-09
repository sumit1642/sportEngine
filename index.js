import express from "express";
import { matchRouter } from "./routes/matches.js";

const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.json());

app.get("/", (req, res) => {
	res.json({ msg: "Hello World" });
});

app.use("/matches", matchRouter);

app.listen(PORT, () => {
	console.log(`Server running on PORT:${PORT}`);
});
