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

    while (true) {
        const query = await getUserInput("Ask a question about the document (or type 'exit' to quit): ");
        if (query.trim().toLowerCase() === 'exit') {
            console.log("Goodbye!");
            break;
        }
        const response = await chatbot.sendMessage(query);
        console.log(`\nQuestion: ${query}`);
        console.log(`Answer: ${response}`);
    }
}

main().catch(console.error);
