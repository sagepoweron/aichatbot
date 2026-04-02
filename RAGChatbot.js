import DocumentProcessor from './documentProcessor.js';
import ChatEngine from './chatEngine.js';

class RAGChatbot {
    constructor() {
        this.documentProcessor = new DocumentProcessor();
        this.chatEngine = new ChatEngine();
    }
    
    async uploadDocument(filePath) {
        // Upload and process a document
        try {
            await this.documentProcessor.processDocument(filePath);
            return `Document successfully processed.`;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }

    resetDocuments() {
        // Reset the document processor
        this.documentProcessor.reset();
        return "Document knowledge has been reset.";
    }

    resetConversation() {
        // Reset the conversation history
        this.chatEngine.resetConversation();
        return "Conversation history has been reset.";
    }

    resetAll() {
        // Reset both conversation and documents
        this.resetConversation();
        this.resetDocuments();
        return "Both conversation history and document knowledge have been reset.";
    }

    async sendMessage(message) {
        // Retrieve relevant document chunks based on the user's query
        const relevantDocs = await this.documentProcessor.retrieveRelevantContext(message);
        
        // Initialize an empty string for the context
        let context = "";
        
        // Loop through each relevant document
        for (const doc of relevantDocs) {
            // Extract the source from metadata, defaulting to 'unknown' if not available
            const source = doc.metadata?.source || 'unknown';
            // Extract the content of the document
            const content = doc.pageContent;
            // Append the source and content to the context string
            context += `Source: ${source}\n${content}\n\n`;
        }
        
        // Send the user's message along with the context to the chat engine
        return await this.chatEngine.sendMessage(message, context);
    }


}

export default RAGChatbot;