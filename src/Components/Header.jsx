import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faCalendarDays,
  faTree,
  faBook,
  faArrowRightToBracket,
  faArrowRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import { jwtDecode } from "jwt-decode";

function isLoggedIn() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp && Date.now() < decoded.exp * 1000) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function logoutAccount() {
  if (isLoggedIn() === false) {
    throw new Error("Token has expired, please log in again");
  }

  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:8080/account/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error?.error || "Something went wrong during logout");
  }
  return res.text();
}

function Header() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  const location = useLocation();
  const navigate = useNavigate();

  const { data, isPending } = useQuery({
    queryKey: ["account-details"],
    enabled: loggedIn,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const details = await fetch("http://localhost:8080/account/my-account", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!details.ok) {
        const error = await details.json();
        throw new Error(error?.error || "Getting account details failed");
      }
      return await details.json();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutAccount,
    onSuccess: () => {
      localStorage.removeItem("token");
      setLoggedIn(false);

      alert("You have been logged out.");
      navigate("/");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        localStorage.removeItem("token");
        setLoggedIn(false);
        navigate("/");
      },
    });
  }

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            state={{ from: location.pathname }}
            className="flex items-center gap-3"
          >
            <img
              src="/images/geco-logo.png"
              alt="geco-logo"
              className="h-9 w-9 object-cover border shadow-gray-400 rounded-lg"
            />
            <div className="leading-tight">
              <span className="block text-lg font-bold tracking-tight">
                GECO
              </span>
              <span className="block text-xs text-[#227B05]">
                Agri‑Eco Tourism Park
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav id="main-nav" aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-5">
              <li>
                <Link
                  to="/"
                  state={{ from: location.pathname }}
                  className="group inline-flex items-center gap-1 rounded-md px-2 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[#48BF56] hover:text-black transition-colors"
                >
                  <FontAwesomeIcon
                    icon={faTree}
                    className="text-[#227B05] group-hover:text-black"
                  />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/#map"
                  state={{ from: location.pathname }}
                  className="group inline-flex items-center gap-1 rounded-md px-2 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[#48BF56] hover:text-black transition-colors"
                >
                  <FontAwesomeIcon
                    icon={faMapLocationDot}
                    className="text-[#227B05] group-hover:text-black"
                  />
                  <span>Park Map</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  state={{ from: location.pathname }}
                  className="group inline-flex items-center gap-1 rounded-md px-2 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[#48BF56] hover:text-black transition-colors"
                >
                  <FontAwesomeIcon
                    icon={faBook}
                    className="text-[#227B05] group-hover:text-black"
                  />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/book"
                  state={{ from: location.pathname }}
                  className="group inline-flex items-center gap-1 rounded-md px-2 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[#48BF56] hover:text-black transition-colors"
                >
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className="text-[#227B05] group-hover:text-black"
                  />
                  <span>Book Visit</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            {/* Desktop CTA */}
            {loggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/my-account"
                  className="hidden lg:flex group items-center  font-semibold gap-2 rounded-md px-3 py-2 text-sm bg-white/50 text-gray-700 hover:bg-[#48BF56] hover:text-black hover:border-transparent transition-colors border h-full"
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-[#227B05] group-hover:text-black"
                  />
                  <span>My Account</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden lg:flex items-center gap-2 rounded-md bg-[#E32726]/90 px-4 py-2 text-sm font-semibold text-white hover:bg-[#E32726] transition-colors"
                >
                  <div className="leading-tight text-left flex flex-col gap-1">
                    <span className="block font-bold">Logout</span>
                  </div>
                  <FontAwesomeIcon
                    icon={faArrowRightFromBracket}
                    className="text-white text-xl"
                  />
                </button>
              </div>
            ) : (
              <Link
                to="/signin"
                state={{ from: location.pathname }}
                className="hidden lg:flex items-center gap-2 rounded-md bg-[#0A7A28]/90 px-4 py-2 text-sm font-semibold text-white hover:bg-[#0A7A28] transition-colors"
              >
                <div className="leading-tight text-left flex flex-col gap-1">
                  <span className="block font-bold">Sign In / Sign Up</span>
                  <span className="block text-[11px] font-normal text-green-100">
                    Explore our Park
                  </span>
                </div>
                <FontAwesomeIcon
                  icon={faArrowRightToBracket}
                  className="text-white text-xl"
                />
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
              aria-label="Toggle navigation"
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <svg
                className={`h-6 w-6 ${open ? "hidden" : "block"}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`h-6 w-6 ${open ? "block" : "hidden"}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden ${open ? "block" : "hidden"} border-t bg-white`}
      >
        <nav aria-label="Primary mobile" className="px-4 py-3">
          <ul className="space-y-2 items-center justify-center flex flex-col">
            <li>
              <Link
                to="/"
                state={{ from: location.pathname }}
                className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-[#48BF56] hover:text-black transition-colors"
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon
                  icon={faTree}
                  className="text-[#227B05] group-hover:text-black"
                />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <a
                href="#map"
                className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-[#48BF56] hover:text-black transition-colors"
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon
                  icon={faMapLocationDot}
                  className="text-[#227B05] group-hover:text-black"
                />
                <span>Park Map</span>
              </a>
            </li>
            <li>
              <Link
                to="/about"
                state={{ from: location.pathname }}
                className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-[#48BF56] hover:text-black transition-colors"
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon
                  icon={faBook}
                  className="text-[#227B05] group-hover:text-black"
                />
                <span>About Us</span>
              </Link>
            </li>
            <li>
              <Link
                to="/book"
                state={{ from: location.pathname }}
                className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-[#48BF56] hover:text-black transition-colors"
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="text-[#227B05] group-hover:text-black"
                />
                <span>Book Visit</span>
              </Link>
            </li>
            {/* Mobile CTA */}
            <li className="pt-2">
              {loggedIn ? (
                <button
                  onClick={handleLogout}
                  className="inline-flex w-fit items-center gap-3 rounded-md bg-[#E32726]/90 px-4 py-3 text-sm font-semibold text-white hover:bg-[#E32726] transition-colors"
                >
                  <div className="leading-tight text-left flex flex-col gap-1">
                    <span className="block font-bold">Logout</span>
                    <span className="block text-[11px] font-normal text-green-100">
                      {isPending
                        ? "Loading..."
                        : `${data?.detail.firstName || ""} ${
                            data?.detail.surname || ""
                          }`}
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={faArrowRightFromBracket}
                    className="text-white text-xl"
                  />
                </button>
              ) : (
                <Link
                  to="/signin"
                  state={{ from: location.pathname }}
                  className="inline-flex w-fit items-center gap-3 rounded-md bg-[#0A7A28]/90 px-4 py-3 text-sm font-semibold text-white hover:bg-[#0A7A28] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <div className="leading-tight text-left">
                    <span className="block font-bold">Sign In / Sign Up</span>
                    <span className="block text-[11px] font-normal text-green-100">
                      Explore our Tourism Park
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={faArrowRightToBracket}
                    className="text-xl"
                  />
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
