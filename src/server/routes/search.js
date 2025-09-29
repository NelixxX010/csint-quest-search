import { Router } from "express";
import { searchInFiles } from "@/utils/fileSearch.js";

const router = Router();

router.get("/", (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const results = searchInFiles("./data", query); // <--- mets tes fichiers ici
  res.json(results);
});

export default router;
