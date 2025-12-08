import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./Pages/Home.jsx";
import About from "./Pages/About.jsx";
import Signin from "./Pages/Signin.jsx";
import Book from "./Pages/Book.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "/signin", element: <Signin /> },
  { path: "/book", element: <Book /> },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}></RouterProvider>
    </QueryClientProvider>
  </StrictMode>
);
