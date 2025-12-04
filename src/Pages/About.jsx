import Footer from "../Components/Footer";
import Header from "../Components/Header";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";

export default function About() {
  return (
    <>
      <Header />

      <div className="bg-green-50 px-20 py-10">
        <div className="flex items-center gap-3 mb-10">
          <Link to="/">
            <FontAwesomeIcon
              icon={faArrowLeftLong}
              className="text-black border rounded-sm p-2"
            />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-bold text-xl">
              About CvSU Agri-Eco Tourism Park
            </h1>
            <p>Discover our mission, vision, and values.</p>
          </div>
        </div>

        <div className="relative h-50 bg-[url('/images/homepage.png')] bg-cover bg-bottom bg-no-repeat rounded-xl flex flex-col items-center justify-center gap-3 shadow-2xl overflow-hidden text-white">
          <div className="absolute inset-0 bg-white/20" />
          <h1 className="font-bold text-5xl relative">Agri-Eco Tourism Park</h1>
          <p className="relative drop-shadow-lg">
            Discover our mission, vision, and values.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
