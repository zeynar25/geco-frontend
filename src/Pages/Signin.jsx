import Footer from "../Components/Footer";
import Header from "../Components/Header";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

async function registerAccount({ email, password, confirmPassword, role }) {
  const res = await fetch("http://localhost:8080/account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, confirmPassword, role }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "Registration failed");
  }
  return res.json();
}

async function loginAccount({ email, password }) {
  const res = await fetch("http://localhost:8080/account/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "Login failed");
  }
  return res.text(); // returns just a token string.
}

function Signin() {
  const [formMode, setFormMode] = useState("login");
  const [show, setShow] = useState(true);
  const navigate = useNavigate();

  function handleSwitch(mode) {
    setShow(false);
    setTimeout(() => {
      setFormMode(mode);
      setShow(true);
    }, 400);
  }

  const registerMutation = useMutation({
    mutationFn: registerAccount,
    onSuccess: () => {
      alert("Account registered!");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginAccount,
    onSuccess: (token) => {
      localStorage.setItem("token", token);

      alert("Login successful!");
      navigate("/");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const password = form.password.value;
    const confirmPassword = form["confirm-password"].value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    registerMutation.mutate({
      email: form.email.value,
      password,
      confirmPassword,
      role: "USER",
    });
  }

  function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    loginMutation.mutate({
      email: form.email.value,
      password: form.password.value,
    });
  }

  return (
    <>
      <Header />
      <div>
        <div className="relative min-h-fit h-[90vh] bg-[url('/images/homepage.png')] bg-cover bg-center bg-no-repeat flex">
          <div className="absolute inset-0 z-0 bg-linear-to-r from-[#17EB88]/50 to-[#0A7A28]/50" />

          <div className="relative w-auto grid grid-cols-2 gap-20 m-auto">
            <div className="z-1 hidden md:flex flex-col items-center justify-center">
              <img
                src="/images/geco-logo.png"
                alt="geco-logo"
                className="h-64"
              />
              <div className="flex flex-col items-center gap-3">
                <h1 className="text-white font-bold text-4xl">Agri-Eco</h1>
                <h1 className="text-[#17EB88] font-bold text-4xl">
                  Tourism Park
                </h1>
                <span className="inline-block rounded-full bg-white/30 px-3 py-1 text-xs font-medium tracking-wide text-white ring-1 ring-white/20">
                  Cavite State University
                </span>
              </div>
            </div>

            <div className="relative col-span-2 md:col-span-1 bg-white xs:rounded-2xl justify-center content-center text-center p-10 shadow-lg">
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
                  <form
                    className="min-h-55 w-full flex flex-col gap-2"
                    onSubmit={handleRegister}
                  >
                    <div className="w-full relative">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="absolute text-xl left-5 top-1/2 -translate-y-1/2"
                      />
                      <input
                        className="w-full border px-2 py-3 pl-15"
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
                        className="absolute text-xl left-5 top-1/2 -translate-y-1/2"
                      />
                      <input
                        className="w-full border px-2 py-3 pl-15"
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
                        className="absolute text-xl left-5 top-1/2 -translate-y-1/2"
                      />
                      <input
                        className="w-full border px-2 py-3 pl-15"
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
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending
                        ? "Registering..."
                        : "Sign Up"}
                    </button>
                  </form>
                ) : (
                  <form
                    className="min-h-55 w-full flex flex-col gap-5"
                    onSubmit={handleLogin}
                  >
                    <div className="w-full relative">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="absolute text-xl left-5 top-1/2 -translate-y-1/2"
                      />
                      <input
                        className="w-full border px-2 py-3 pl-15"
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
                        className="absolute text-xl left-5 top-1/2 -translate-y-1/2"
                      />
                      <input
                        className="w-full border px-2 py-3 pl-15"
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
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Sign In"}
                    </button>
                  </form>
                )}
              </div>

              {formMode === "register" ? (
                <span className="block mt-5">
                  Already have an account?{" "}
                  <button
                    className="text-[#227B05] cursor-pointer"
                    onClick={() => handleSwitch("signin")}
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span className="block mt-5">
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
      </div>
      <Footer />
    </>
  );
}

export default Signin;
