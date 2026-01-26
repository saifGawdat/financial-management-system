import { GoogleGenerativeAI } from "@google/generative-ai";

const tools = [
  {
    functionDeclarations: [
      {
        name: "navigate",
        description: "Navigate to a specific page in the application",
        parameters: {
          type: "OBJECT",
          properties: {
            page: {
              type: "STRING",
              description:
                "The name of the page to navigate to. Options: dashboard, income, expense, employees, salaries, profit-summary, customers, settings",
            },
          },
          required: ["page"],
        },
      },
      {
        name: "add_transaction",
        description: "Add a new financial transaction (income or expense)",
        parameters: {
          type: "OBJECT",
          properties: {
            type: {
              type: "STRING",
              description: "The type of transaction: 'income' or 'expense'",
            },
            title: {
              type: "STRING",
              description: "A short title for the transaction",
            },
            amount: {
              type: "NUMBER",
              description: "The amount of the transaction",
            },
            category: {
              type: "STRING",
              description:
                "The category of the transaction (e.g., Salary, Rent, Food)",
            },
            date: {
              type: "STRING",
              description:
                "The date of the transaction in YYYY-MM-DD format. If not provided, use the current date.",
            },
            description: {
              type: "STRING",
              description: "A longer description of the transaction (optional)",
            },
          },
          required: ["type", "title", "amount", "category"],
        },
      },
    ],
  },
];

const getModel = (modelName = "gemini-1.5-flash") => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    throw new Error(
      "Gemini API Key is missing or using placeholder. Please set VITE_GEMINI_API_KEY in your .env file.",
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    return genAI.getGenerativeModel({
      model: modelName,
      tools: tools,
    });
  } catch (err) {
    throw new Error(
      `Failed to initialize Gemini AI with model ${modelName}: ` + err.message,
    );
  }
};

export const processAICommand = async (command, history = []) => {
  // List of models provided by the user as free-tier compatible.
  const modelsToTry = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-pro",
  ];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = getModel(modelName);
      const chat = model.startChat({
        history: history,
      });

      const result = await chat.sendMessage(command);
      const response = await result.response;

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("AI returned no response.");
      }

      const call = response.functionCalls()?.[0];

      return {
        type: call ? "function_call" : "text",
        name: call?.name,
        args: call?.args,
        text: response.text(),
      };
    } catch (error) {
      const isNotFoundError =
        error.message?.includes("404") || error.message?.includes("not found");
      const isQuotaError =
        error.message?.includes("429") || error.message?.includes("quota");

      if (isNotFoundError || isQuotaError) {
        console.warn(
          `Model ${modelName} failed (${isQuotaError ? "Quota" : "Not Found"}):`,
          error.message,
        );
        lastError = error;
        continue;
      }

      // For other errors (like API key invalid), stop and throw
      throw error;
    }
  }

  throw lastError;
};
