const express = require("express");
const cors = require("cors");
const moodRoutes = require("./routes/mood.routes");
const authRoutes = require("./routes/auth.routes");
const journalRoutes = require("./routes/journal.routes");
const activityRoutes = require("./routes/activity.routes");

const app = express();

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
app.use("/api/moods", moodRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/auth", authRoutes);

=======
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

<<<<<<< HEAD
module.exports = app;

=======
app.use("/api/auth", authRoutes);

module.exports = app;
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
