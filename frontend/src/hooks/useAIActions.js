import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export const useAIActions = () => {
  const navigate = useNavigate();

  const handleAction = async (action) => {
    console.log("AI Action Triggered:", action);

    if (action.type === "function_call") {
      const { name, args } = action;

      switch (name) {
        case "navigate": {
          const route =
            args.page === "dashboard" ? "/dashboard" : `/${args.page}`;
          navigate(route);
          return `Navigated to ${args.page}`;
        }

        case "add_transaction":
          try {
            const endpoint = args.type === "income" ? "/income" : "/expense";
            const payload = {
              title: args.title,
              amount: args.amount,
              category: args.category,
              date: args.date || new Date().toISOString().split("T")[0],
              description: args.description || "",
            };
            await API.post(endpoint, payload);

            // Refresh current page if it might be affected
            // Simplified: refresh the window or just rely on navigation to update state if we navigate away and back
            // For better UX, we'd use a global state or a refresh event
            window.dispatchEvent(new CustomEvent("refreshData"));

            return `Successfully added ${args.type}: ${args.title} for ${args.amount}`;
          } catch (error) {
            console.error("Error adding transaction via AI:", error);
            return `Failed to add ${args.type}. Error: ${error.message}`;
          }

        default:
          return `Unknown action: ${name}`;
      }
    }

    return null;
  };

  return { handleAction };
};
