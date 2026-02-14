const express = require("express");
const cors = require("cors");
const moodRoutes = require("./routes/mood.routes");
const authRoutes = require("./routes/auth.routes");
const journalRoutes = require("./routes/journal.routes");
const app = express();
app.use("/api/moods", moodRoutes);

app.use("/api/journals", journalRoutes);



app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/api/auth", authRoutes);

module.exports = app;
