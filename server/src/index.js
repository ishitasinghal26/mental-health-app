require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const app = require("./app");
const pool = require("../config/db");

const PORT = process.env.PORT || 4000;

pool.query("SELECT 1")
  .then(() => console.log("PostgreSQL Connected Successfully"))
  .catch(err => console.error("DB Connection Error:", err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});