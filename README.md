# Description
This is a RAG chatbot that answers questions using the book of Proverbs, which is full of advice for living a godly life.

## Features
- Splits a PDF document into chunks and stores them in a vector store for retrieval by the chatbot.
- Retrieves queries from the user and provides responses based on the provided document.
- Maintains a history of asked questions and responses.
- The document can be replaced with other documents for a more modular application.

## Tools Used
- JavaScript
- LangChain
- Open AI
- VS Code

## How To Setup Project
1. Clone or download the repository to a folder on your computer.
2. Open the project in Visual Studio or VS Code.
3. Open the terminal.
4. Install dependencies by typing the command "npm install".
5. Create a .env file based on the example and replacing the keys with ones of your own.
6. For the GITHUB_TOKEN use a key created from GitHub using the gpt-4o-mini model.
7. For the EMBEDDING_TOKEN use a key created from GitHub using the text-embedding-3-small model.

## How To Run From The Terminal
1. Run the application by typing the command "node app.js".
2. Ask questions for the chatbot to answer.
3. Type "exit" or press CTRL and C together to quit the application.

## How to Run From The Browser Using A Local Server
1. Start a local server by typing the command "node server.js".
2. Hold CTRL and click on the link displayed in the terminal to open your web browser.
3. Ask questions for the chatbot to answer.
4. Press CTRL and C in the terminal to stop the server.
5. Close your web browser.
