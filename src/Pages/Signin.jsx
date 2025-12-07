import Footer from "../Components/Footer";
import Header from "../Components/Header";
import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

function Signin() {
  const [formMode, setFormMode] = useState("register");
  const [show, setShow] = useState(true);

  function handleSwitch(mode) {
    setShow(false);
    setTimeout(() => {
      setFormMode(mode);
      setShow(true);
    }, 200);
  }

  return (
    <>
      <Header />
      <div>
        <div className="relative h-[90vh] bg-[url('/images/homepage.png')] bg-cover bg-center bg-no-repeat grid grid-cols-2">
          <div className="absolute inset-0 z-0 bg-linear-to-r from-[#227B05]/10 to-[#227B05]/50" />

          <div className="z-1 hidden md:flex flex-col items-center justify-center h-fit md:h-auto m-auto md:m-0">
            <img
              src="/images/agri-eco-logo.png"
              alt="agri-eco-logo"
              className="h-64"
            />
            <div className="flex flex-col items-center gap-3">
              <h1 className="text-white font-bold text-4xl">Agri-Eco</h1>
              <h1 className="text-green-600 font-bold text-4xl">
                Tourism Park
              </h1>
              <span className="inline-block rounded-full bg-white/30 px-3 py-1 text-xs font-medium tracking-wide text-white ring-1 ring-white/20">
                Cavite State University
              </span>
            </div>
          </div>

          <div className="relative col-span-2 md:col-span-1 bg-white xs:rounded-2xl md:rounded-r-none justify-items-center text-center p-20 h-fit md:h-auto m-auto md:m-0 shadow-lg">
            <div className="flex flex-col gap-2 mb-10 w-full">
              <h1 className="font-bold text-2xl text-[#227B05]">Welcome</h1>
              <span>
                {formMode === "register"
                  ? "Create your account to continue"
                  : "Sign in your account to continue"}
              </span>
            </div>

            <div
              className={`transition-opacity duration-300 ${
                show ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {formMode === "register" ? (
                <form className="w-full flex flex-col gap-2">
                  <div className="w-full relative">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="absolute text-2xl left-5 top-1/2 -translate-y-1/2"
                    />
                    <input
                      className="w-full border px-3 py-5 pl-15"
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div className="w-full relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute text-2xl left-5 top-1/2 -translate-y-1/2"
                    />
                    <input
                      className="w-full border px-3 py-5 pl-15"
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Password"
                      required
                    />
                  </div>
                  <div className="w-full relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute text-2xl left-5 top-1/2 -translate-y-1/2"
                    />
                    <input
                      className="w-full border px-3 py-5 pl-15"
                      type="password"
                      id="confirm-password"
                      name="confirm-password"
                      placeholder="Confirm Password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#227B05] text-white py-3 rounded-lg"
                  >
                    Sign Up
                  </button>
                </form>
              ) : (
                <form className="w-full flex flex-col gap-5">
                  <div className="w-full relative">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="absolute text-2xl left-5 top-1/2 -translate-y-1/2"
                    />
                    <input
                      className="w-full border px-3 py-5 pl-15"
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div className="w-full relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute text-2xl left-5 top-1/2 -translate-y-1/2"
                    />
                    <input
                      className="w-full border px-3 py-5 pl-15"
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#227B05] text-white py-3 rounded-lg"
                  >
                    Sign In
                  </button>
                </form>
              )}
            </div>

            {formMode === "register" ? (
              <span>
                Already have an account?{" "}
                <button
                  className="text-[#227B05] cursor-pointer"
                  onClick={() => handleSwitch("signin")}
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{" "}
                <button
                  className="text-[#227B05] cursor-pointer"
                  onClick={() => handleSwitch("register")}
                >
                  Sign Up
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Signin;
