import fs from "fs";
import { ChatOpenAI } from "@langchain/openai";
//import path from "path";
import { createAgent } from "langchain";
//import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import dotenv from "dotenv";
import readline from "readline";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";


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
    const embeddingToken = process.env.EMBEDDING_TOKEN;
    const endpoint = "https://models.github.ai/inference";
    const embeddingModel = "openai/text-embedding-3-small";

    
    if (!githubToken) {
        console.error("Error: GITHUB_TOKEN not found.");
        process.exit(1);
    }
    if (!embeddingToken) {
        console.error("Error: EMBEDDING_TOKEN not found.");
        process.exit(1);
    }
    
    /*const tavilyApiKey = process.env.TAVILY_API_KEY;
    if (!tavilyApiKey) {
        console.error("Error: TAVILY_API_KEY not found.");
        process.exit(1);
    }*/

    const llm = new ChatOpenAI({
        modelName: "openai/gpt-4o-mini",
        temperature: 0.7,
        configuration: {
        baseURL: endpoint,
        apiKey: githubToken,
        },
    });

    const pdfLoader = new PDFLoader("./documents/proverbs.pdf");
    const pdfDocs = await pdfLoader.load();
    console.log("PDF loaded with content:");
    //console.log(pdfDocs.map(d => d.pageContent).join("\n---\n"));

    const textSplitter = new CharacterTextSplitter({ chunkSize: 500, chunkOverlap: 0 });
    const splitDocs = await textSplitter.splitDocuments(pdfDocs);
    console.log(`PDF split into ${splitDocs.length} chunks.`);

    // Initialize embeddings model
    const embeddings = new OpenAIEmbeddings({
        model: embeddingModel,
        configuration: {
            baseURL: endpoint,
            apiKey: embeddingToken
        },
    });

    const vectorStore = await MemoryVectorStore.fromDocuments([], embeddings);
    await vectorStore.addDocuments(splitDocs);

    console.log(`✅ Successfully created vector store with ${vectorStore.memoryVectors.length} documents.`);

    //console.log(vectorStore.memoryVectors[0]);

    //const query = "What does the Bible say about wisdom?";
    const userInput = "A wise son maketh a glad father: but a foolish man despiseth his mother.";
    //const userInput = await getUserInput("Enter a topic to search for in the PDF: ");

    /*const results = await vectorStore.similaritySearchWithScore(userInput, 3);
    console.log("\n=== Similarity Search Results ===\n");
    results.forEach(([doc, score], index) => {
        //console.log(`Rank ${index + 1}:`);
        //console.log(doc.pageContent);
        //console.log(`Metadata: ${JSON.stringify(doc.metadata)}`);
        console.log(`${index + 1}: Score: ${score.toFixed(4)}, Page: ${doc.metadata.loc.pageNumber || "N/A"}, Lines: ${doc.metadata.loc.lines ? `${doc.metadata.loc.lines.from}-${doc.metadata.loc.lines.to}` : "N/A"}`);
        //console.log(`Similarity Score: ${score.toFixed(4)}`);
        //console.log("---");
    });*/

    const retriever = vectorStore.asRetriever({
        searchType: "similarity",
        k: 3,
    });

    const relevantDocs = await retriever.invoke(userInput);

    console.log("\n=== Retriever Output ===\n");
    //console.log(relevantDocs);
    console.log(relevantDocs[0].pageContent);

}

main().catch(console.error);
