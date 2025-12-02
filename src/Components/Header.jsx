import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faCalendarDays,
  faTree,
  faBook,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <img
              src="/images/agri-eco-logo.png"
              alt="Geco-logo"
              className="h-9 w-9 rounded bg-gray-200 object-cover"
            />
            <div className="leading-tight">
              <span className="block text-lg font-bold tracking-tight">
                GECO
              </span>
              <span className="block text-xs text-gray-500">
                Agri‑Eco Tourism Park
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav id="main-nav" aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-5">
              <li>
                <a
                  href="#home"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-green-100 hover:text-black transition-colors"
                >
                  <FontAwesomeIcon icon={faTree} className="text-green-600" />
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a
                  href="#map"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-green-100 hover:text-black transition-colors"
                >
                  <FontAwesomeIcon
                    icon={faMapLocationDot}
                    className="text-green-600"
                  />
                  <span>Park Map</span>
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-green-100 hover:text-black transition-colors"
                >
                  <FontAwesomeIcon icon={faBook} className="text-green-600" />
                  <span>About Us</span>
                </a>
              </li>
              <li>
                <a
                  href="#book"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-green-100 hover:text-black transition-colors"
                >
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className="text-green-600"
                  />
                  <span>Book Visit</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            {/* Desktop CTA */}
            <a
              href="/signin"
              className="hidden md:flex items-center gap-1 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              <div className="leading-tight text-left">
                <span className="block font-bold">Sign Up</span>
                <span className="block text-[11px] font-normal text-green-100">
                  Explore our Park
                </span>
              </div>
              <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                className="text-white"
              />
            </a>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
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
        className={`md:hidden ${open ? "block" : "hidden"} border-t bg-white`}
      >
        <nav aria-label="Primary mobile" className="px-4 py-3">
          <ul className="space-y-2 items-center justify-center flex flex-col">
            <li>
              <a
                href="#home"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-black transition-colors"
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon icon={faTree} className="text-green-600" />
                <span>Home</span>
              </a>
            </li>
            <li>
              <a
                href="#map"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-black transition-colors"
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon
                  icon={faMapLocationDot}
                  className="text-green-600"
                />
                <span>Park Map</span>
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-black transition-colors"
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon icon={faBook} className="text-green-600" />
                <span>About Us</span>
              </a>
            </li>
            <li>
              <a
                href="#book"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-black transition-colors"
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="text-green-600"
                />
                <span>Book Visit</span>
              </a>
            </li>
            {/* Mobile CTA */}
            <li className="pt-2">
              <a
                href="/signin"
                className="inline-flex w-fit items-center gap-3 rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                onClick={() => setOpen(false)}
              >
                <div className="leading-tight text-left">
                  <span className="block font-bold">Sign In / Sign Up</span>
                  <span className="block text-[11px] font-normal text-green-100">
                    Explore our Tourism Park
                  </span>
                </div>
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
