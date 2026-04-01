import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import readline from "readline";
import { RetrievalQAChain } from "@langchain/classic/chains";
import DocumentProcessor from './documentProcessor.js';


dotenv.config();

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

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
        console.error("Error: GITHUB_TOKEN not found.");
        process.exit(1);
    }
    
    const llm = new ChatOpenAI({
        modelName: "openai/gpt-4o-mini",
        temperature: 0.7,
        configuration: {
        baseURL: "https://models.github.ai/inference",
        apiKey: githubToken,
        },
    });

    const documentProcessor = new DocumentProcessor();
    await documentProcessor.processDocument("./documents/proverbs.pdf");
    
    //const query = "What does the Bible say about wisdom?";
    // Get user question for QA
    const userInput = await getUserInput("Ask a question about the document: ");

    // QA Chain: Retrieve relevant docs and answer
    const retriever = documentProcessor.vectorstore.asRetriever({
        searchType: "similarity",
        k: 3,
    });

    const chain = RetrievalQAChain.fromLLM(llm, retriever, {
        returnSourceDocuments: true,
    });

    const answer = await chain.invoke({ query: userInput });
    console.log("\n=== RetrievalQAChain Answer ===\n");
    console.log(answer?.text || "No answer generated.");

    /*const chatHistory = [ answer.input, answer.text ];

    const userInput2 = await getUserInput("Is there anything else to ask? ");
    const answer2 = await chain.invoke({ query: userInput2, chat_history: chatHistory });
    console.log("\n=== RetrievalQAChain Answer with Chat History ===\n");
    console.log(answer2?.text || "No answer generated.");*/
}

main().catch(console.error);
