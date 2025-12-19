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

import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createBrowserRouter([
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
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}></RouterProvider>
    </QueryClientProvider>
  </StrictMode>
);
