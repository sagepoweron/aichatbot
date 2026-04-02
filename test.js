import readline from "readline";
import { RetrievalQAChain } from "@langchain/classic/chains";
import DocumentProcessor from './documentProcessor.js';
import ChatEngine from './chatEngine.js';


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

    // Initialize the chat engine
    const chatEngine = new ChatEngine();

    //test 1
    /*const query = "What is your name?";
    const response = await chatEngine.sendMessage(query, "Your name is Bill Nye and you are a running coach.");
    console.log(`Question: ${query}`);
    console.log(`Answer: ${response}`);*/

    //test 2 - no context provided, should politely refuse to answer
    /*const query = "What is the capital of France?";
    const response = await chatEngine.sendMessage(query);
    console.log(`\nQuestion: ${query}`);
    console.log(`Answer: ${response}`);*/

    //test 3 - context provided, should answer based on the context
    // Send a message with context (should answer using only the context)
    const context = `Paris is the capital and most populous city of France. The Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral are among its most famous landmarks.`;
    const query = "What are some famous landmarks in France?";
    const response = await chatEngine.sendMessage(query, context);
    console.log(`\nQuestion: ${query}`);
    console.log(`Answer: ${response}`);

    // Print updated conversation history
    console.log("\nUpdated conversation history:");
    //console.log(chatEngine.conversationHistory);

    console.log(chatEngine.conversationHistory.map((msg, index) => `${index + 1}. ${msg.type}: ${msg.text}`).join("\n"));

}

main().catch(console.error);
