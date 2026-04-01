import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";



class DocumentProcessor {
    constructor() {
        this.chunkSize = 1000;
        this.chunkOverlap = 100;
        this.embeddingModel = new OpenAIEmbeddings({
            model: "openai/text-embedding-3-small",
            configuration: {
                baseURL: "https://models.github.ai/inference",
                apiKey: process.env.EMBEDDING_TOKEN
            },
        });
        this.vectorstore = null;
    }

    async loadDocument(filePath) {
        // Load a document based on its file type
        if (filePath.endsWith('.pdf')) {
            const loader = new PDFLoader(filePath);
            return await loader.load();
        } else {
            throw new Error("Unsupported file format");
        }
    }

    async processDocument(filePath) {
        // Load the document
        const docs = await this.loadDocument(filePath);
        
        // Split the document into chunks
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap
        });
        const splitDocs = await textSplitter.splitDocuments(docs);
        
        // Create or update the vector store
        if (this.vectorstore === null) {
            this.vectorstore = await MemoryVectorStore.fromDocuments(splitDocs, this.embeddingModel);
        } else {
            await this.vectorstore.addDocuments(splitDocs);
            console.log(`✅ Added ${splitDocs.length} new chunks to the vector store. Total chunks: ${this.vectorstore.memoryVectors.length}`);
        }
        
        return splitDocs;
    }

    async retrieveRelevantContext(query, k = 3) {
        // Retrieve relevant document chunks for a query
        if (this.vectorstore === null) {
            return [];
        }
        
        return await this.vectorstore.similaritySearch(query, k);
    }

    reset() {
        // Reset the document processor
        this.vectorstore = null;
    }
}

export default DocumentProcessor;