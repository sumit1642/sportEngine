import express from "express";

const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.json());

app.get("/", (req, res) => {
	res.json({ msg: "Hello World" });
});

app.listen(PORT, () => {
	console.log(`Server running on PORT:${PORT}`);
});
