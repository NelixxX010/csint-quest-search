import express from "express";
import { searchInFiles } from "./fileSearch.js";

const app = express();

app.get("/api/search", (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const results = searchInFiles("./data", query); // mets tes fichiers dans ./data
  res.json(results);
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ API backend running on http://localhost:${PORT}`);
});
