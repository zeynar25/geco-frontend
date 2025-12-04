import Footer from "../Components/Footer";
import Header from "../Components/Header";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faBook,
  faBuilding,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import AboutCard from "../Components/AboutCard";

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

        <div className="grid grid-cols-2">
          <AboutCard
            headerBg="bg-green-50"
            headerColor="text-[#227B05]"
            icon={<FontAwesomeIcon icon={faBuilding} />}
            title="CvSU Mission"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            className="col-span-2 md:col-span-1"
          />

          <AboutCard
            headerBg="bg-blue-50"
            headerColor="text-blue-600"
            icon={<FontAwesomeIcon icon={faEye} />}
            title="CvSU Vision"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            className="col-span-2 md:col-span-1"
          />

          <div></div>

          <AboutCard
            headerBg="bg-green-50"
            icon={<FontAwesomeIcon icon={faBook} />}
            iconColor="text-[#227B05]"
            title="History"
            titleColor="text-[#227B05]"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            className="col-span-2"
          />
        </div>
      </div>

      <Footer />
    </>
  );
}
