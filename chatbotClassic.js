import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import readline from "readline";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { RetrievalQAChain } from "@langchain/classic/chains";


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
    // Get user question for QA
    const userInput = await getUserInput("Ask a question about the document: ");

    // QA Chain: Retrieve relevant docs and answer
    const retriever = vectorStore.asRetriever({
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
