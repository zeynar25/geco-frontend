import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./Pages/Home.jsx";
import About from "./Pages/About.jsx";
import Signin from "./Pages/Signin.jsx";
import Book from "./Pages/Book.jsx";
import OperatingHours from "./Pages/OperatingHours.jsx";
import PackagesPromos from "./Pages/PackagesPromos.jsx";
import ParkCalendar from "./Pages/ParkCalendar.jsx";
import BookingSuccess from "./Pages/BookingSuccess.jsx";
import Account from "./Pages/Account.jsx";
import Attraction from "./Pages/Attraction.jsx";
import Feedback from "./Pages/Feedback.jsx";
import AdminDashboard from "./Pages/AdminDashboard.jsx";
import AppLayout from "./Components/AppLayout.jsx";

import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupCustomDialogs } from "./customDialogs";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/signin", element: <Signin /> },
      { path: "/book", element: <Book /> },
      { path: "/operating-hours", element: <OperatingHours /> },
      { path: "/packages-promos", element: <PackagesPromos /> },
      { path: "/park-calendar", element: <ParkCalendar /> },
      { path: "/booking-success", element: <BookingSuccess /> },
      { path: "/my-account", element: <Account /> },
      { path: "/attractions/:id", element: <Attraction /> },
      { path: "/feedback", element: <Feedback /> },
      { path: "/admin", element: <AdminDashboard /> },
    ],
  },
]);

const handleGlobalQueryError = async (error) => {
  if (!error) return;
  console.log("Global query onError fired", error);
  const message = error?.message || (error?.toString && error.toString());
  if (message === "TOKEN_EXPIRED") {
    const msg = "Your session has expired. Please sign in again.";
    if (typeof window !== "undefined" && window.__showAlert) {
      try {
        await window.__showAlert(msg);
      } catch {
        // fallback to native alert if showAlert fails
        window.__nativeAlert?.(msg) || alert(msg);
      }
    } else {
      window.__nativeAlert?.(msg) || alert(msg);
    }

    window.location.href = "/signin";
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { onError: handleGlobalQueryError },
    mutations: { onError: handleGlobalQueryError },
  },
});

setupCustomDialogs();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}></RouterProvider>
    </QueryClientProvider>
  </StrictMode>
);
