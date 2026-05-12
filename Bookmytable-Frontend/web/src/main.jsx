import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

import { AuthProvider } from "./context/AuthContext";
import { BranchProvider } from "./context/BranchContext";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BranchProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BranchProvider>
  </AuthProvider>
);