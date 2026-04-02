import readline from "readline";
import RAGChatbot from './RAGChatbot.js';


function getUserInput(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer);
        });
    });
}

async function main() {

    // Initialize the RAG chatbot
    const chatbot = new RAGChatbot();

    // Upload a document
    const result = await chatbot.uploadDocument("./documents/proverbs.pdf");
    console.log(result);

    // Send a message about the document
    //const query = "What does the Bible say about wisdom?";

    // Get user question for QA
    const query = await getUserInput("Ask a question about the document: ");

    const response = await chatbot.sendMessage(query);
    console.log(`\nQuestion: ${query}`);
    console.log(`Answer: ${response}`);
    
}

main().catch(console.error);
