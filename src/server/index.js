import express from "express";
import searchRouter from "./routes/search.js";

const app = express();

app.use("/api/search", searchRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API backend running on http://localhost:${PORT}`);
});
