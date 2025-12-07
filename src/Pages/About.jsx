import Footer from "../Components/Footer";
import Header from "../Components/Header";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faAward,
  faBook,
  faBuilding,
  faEye,
  faHandsHolding,
  faLeaf,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons";

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
            headerBg="bg-[#a9e2a3]"
            headerColor="text-[#227B05]"
            icon={<FontAwesomeIcon icon={faBuilding} />}
            title="CvSU Mission"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            className="col-span-2 md:col-span-1"
          />

          <AboutCard
            headerBg="bg-blue-50"
            headerColor="text-blue-900"
            icon={<FontAwesomeIcon icon={faEye} />}
            title="CvSU Vision"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            className="col-span-2 md:col-span-1"
          />

          <div className="col-span-2 rounded-xl border-0 shadow-sm overflow-hidden m-5">
            <header className="flex items-center px-10 py-5 gap-3 bg-[#CEB8F2] text-[#7942C2]">
              <span className="text-xl">
                <FontAwesomeIcon icon={faLeaf} />
              </span>
              <h1 className="font-bold text-xl">Our Core Values</h1>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="px-10 py-5 flex flex-col justify-center items-center text-center gap-3 bg-white">
                <FontAwesomeIcon
                  icon={faHandsHolding}
                  className=" bg-[#a9e2a3] text-[#227B05] p-5 rounded-xl"
                />
                <h3 className="font-bold text-md">First Core Value</h3>
                <p className="text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Mollitia illum minima tempora voluptatum, veniam vitae
                  voluptates officiis, distinctio ea impedit facilis vel dolore.
                </p>
              </div>

              <div className="px-10 py-5 flex flex-col justify-center items-center text-center gap-3 bg-white">
                <FontAwesomeIcon
                  icon={faUserGroup}
                  className=" bg-blue-50 text-blue-900 p-5 rounded-xl"
                />
                <h3 className="font-bold text-md">Second Core Value</h3>
                <p className="text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Mollitia illum minima tempora voluptatum, veniam vitae
                  voluptates officiis, distinctio ea impedit facilis vel dolore.
                </p>
              </div>

              <div className="px-10 py-5 flex flex-col justify-center items-center text-center gap-3 bg-white">
                <FontAwesomeIcon
                  icon={faAward}
                  className=" bg-[#F5F3C9] text-[#ADA128] p-5 rounded-xl"
                />
                <h3 className="font-bold text-md">Third Core Value</h3>
                <p className="text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Mollitia illum minima tempora voluptatum, veniam vitae
                  voluptates officiis, distinctio ea impedit facilis vel dolore.
                </p>
              </div>
            </div>
          </div>

          <AboutCard
            headerBg="bg-[#F5F3C9]"
            headerColor="text-[#ADA128]"
            icon={<FontAwesomeIcon icon={faBook} />}
            title="History"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            className="col-span-2"
          />

          <div className="col-span-2 rounded-xl border-0 shadow-sm overflow-hidden m-5">
            <header className="flex flex-col px-10 py-5 bg-[#227B05] text-white">
              <div className="flex gap-2">
                <span className="text-xl">
                  <FontAwesomeIcon icon={faCircleQuestion} />
                </span>
                <h1 className="font-bold text-xl">
                  Frequently Asked Questions
                </h1>
              </div>

              <p className="text-sm">
                Everything you need to know before you visit Agri-Eco Tourism
                Park
              </p>
            </header>
            <div></div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
