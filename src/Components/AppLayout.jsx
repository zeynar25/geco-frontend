import { Outlet } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";

export default function AppLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}
