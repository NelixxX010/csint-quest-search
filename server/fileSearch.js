import fs from "fs";
import path from "path";

export function searchInFiles(directory, query) {
  const results = [];
  const allowedExtensions = [".sql", ".db", ".txt"];

  function exploreFolder(folder) {
    const items = fs.readdirSync(folder, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(folder, item.name);

      if (item.isDirectory()) {
        exploreFolder(fullPath);
      } else {
        const ext = path.extname(item.name).toLowerCase();
        if (allowedExtensions.includes(ext)) {
          const fileContent = fs.readFileSync(fullPath, "utf-8");
          fileContent.split("\n").forEach((line, idx) => {
            if (line.toLowerCase().includes(query.toLowerCase())) {
              results.push({
                file: fullPath,
                line: idx + 1,
                content: line.trim(),
              });
            }
          });
        }
      }
    }
  }

  exploreFolder(directory);
  return results;
}
