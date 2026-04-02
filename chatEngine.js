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
        this.systemMessage = "You are a helpful assistant that ONLY answers questions based on the " +
            "provided context. If no relevant context is provided, do NOT answer the " +
            "question and politely inform the user that you don't have the necessary " +
            "information to answer their question accurately.";

        /*
        // Define the prompt template with explicit system and human messages
        this.prompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(this.systemMessage),
            HumanMessagePromptTemplate.fromTemplate("Context:\n{context}\n\nQuestion: {question}")
        ]);*/

        // Optionally, keep conversation history for display/logging only
        this.conversationHistory = [];
    }


    async sendMessage(userMessage, context = "") {

        //const systemTemplate = "You are a running coach! Your name is Bill Nye.";
        //const systemTemplate = "You are a helpful assistant that translates {inputLanguage} to {outputLanguage}.";
        
        /*const systemTemplate = "You are a helpful assistant that ONLY answers questions based on the " +
            "provided context. If no relevant context is provided, do NOT answer the " +
            "question and politely inform the user that you don't have the necessary " +
            "information to answer their question accurately.";*/
        //const humanTemplate="{text}";
        const humanTemplate = "Context:\n{context}\n\nQuestion: {question}";

        const systemMessage = SystemMessagePromptTemplate.fromTemplate(this.systemMessage);
        const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate);

        //const systemMessage = await systemMessagePrompt.invoke({inputLanguage: "English", outputLanguage: "French"});
        //const humanMessage = await humanMessagePrompt.invoke({text: "I love programming!"});

        const prompt = ChatPromptTemplate.fromMessages([
            systemMessage,
            humanMessage
        ]);

        const messages = await prompt.formatMessages({
            context: context,
            question: userMessage
        });

        /*
        // Format the messages using the prompt template (includes system message)
        const messages = await prompt.formatMessages({
            inputLanguage: "English",
            outputLanguage: "French",
            text: userMessage
        });*/

        //console.log(messages);
        





        /*const messages = [
            new SystemMessage("You are a running coach! Your name is Bill Nye."),
            new HumanMessage("What is your name?")
        ]*/
        
       
        // Get the response from the model
        const response = await this.chatModel.invoke(messages);

        // Optionally, track the conversation for display/logging
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