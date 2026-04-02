import express from "express";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import RAGChatbot from "./RAGChatbot.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
// Serve static index.html
app.use(express.static(path.join(__dirname)));


let chatbot;

async function initQA() {
  chatbot = new RAGChatbot();
  await chatbot.uploadDocument("./documents/proverbs.pdf");
}

app.post("/api/qa", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Missing question" });
    const answer = await chatbot.sendMessage(question);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

initQA().then(() => {
  app.listen(3000, () => {
    console.log("QA API server running on http://localhost:3000");
  });
});
