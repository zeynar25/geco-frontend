import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./Pages/Home.jsx";
import About from "./Pages/About.jsx";
import Signin from "./Pages/Signin.jsx";
import Book from "./Pages/Book.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "/signin", element: <Signin /> },
  { path: "/book", element: <Book /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>
);
