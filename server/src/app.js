const express = require("express");
const cors = require("cors");
const moodRoutes = require("./routes/mood.routes");
const authRoutes = require("./routes/auth.routes");
const journalRoutes = require("./routes/journal.routes");
const activityRoutes = require("./routes/activity.routes");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profile.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/moods", moodRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

module.exports = app;

