import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import dotenv from "dotenv";

dotenv.config();

class ChatEngine {
    constructor() {
        
        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) {
            console.error("Error: GITHUB_TOKEN not found.");
            process.exit(1);
        }

        // Initialize the chat model
        this.chatModel = new ChatOpenAI({
            modelName: "openai/gpt-4o-mini",
            temperature: 0.7,
            configuration: {
            baseURL: "https://models.github.ai/inference",
            apiKey: githubToken,
            },
        });

        // Define the system message that sets the behavior of the assistant
        /*this.systemMessage = "You are a helpful assistant that ONLY answers questions based on the " +
            "provided context. If no relevant context is provided, do NOT answer the " +
            "question and politely inform the user that you don't have the necessary " +
            "information to answer their question accurately.";*/
        this.systemMessage = "You are a helpful assistant that answers questions based on the " +
            "provided context. If no relevant context is provided, you can still attempt to answer the " +
            "question based on your general knowledge, but you should indicate that your answer is not based on the provided context.";

        
        // Define the prompt template with explicit system and human messages
        this.prompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(this.systemMessage),
            HumanMessagePromptTemplate.fromTemplate("Context:\n{context}\n\nConversation History:\n{history}\n\nQuestion: {question}")
        ]);

        // Store conversation history for context
        this.conversationHistory = [];
    }


    async sendMessage(userMessage, context = "") {
        // Prepare the last N exchanges for history (e.g., last 6 messages)
        const N = 6;
        const historySlice = this.conversationHistory.slice(-N);
        let historyText = "";
        for (const msg of historySlice) {
            if (msg instanceof HumanMessage) {
                historyText += `User: ${msg.content}\n`;
            } else if (msg instanceof AIMessage) {
                historyText += `Bot: ${msg.content}\n`;
            }
        }

        // Format the messages using the prompt template (includes system message)
        const messages = await this.prompt.formatMessages({
            context: context,
            history: historyText.trim(),
            question: userMessage
        });

        // Get the response from the model
        const response = await this.chatModel.invoke(messages);

        // Track the conversation for context
        this.conversationHistory.push(new HumanMessage({ content: userMessage }));
        this.conversationHistory.push(new AIMessage({ content: response.content }));

        // Return the AI's response
        return response.content;
    }

    resetConversation() {
        // Reset the conversation history
        this.conversationHistory = [];
        return "Conversation history has been reset.";
    }
}

export default ChatEngine;