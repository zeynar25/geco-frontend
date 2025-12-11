import Footer from "../Components/Footer";
import Header from "../Components/Header";
import ValueCard from "../Components/ValueCard.jsx";
import HeaderCard from "../Components/HeaderCard.jsx";
import Faq from "../Components/Faq";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAward,
  faBook,
  faBuilding,
  faEye,
  faHandsHolding,
  faLeaf,
  faLocationDot,
  faPhone,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

import { faCircleQuestion, faClock } from "@fortawesome/free-regular-svg-icons";
import BackButton from "../Components/BackButton.jsx";
import { useLocation, Link } from "react-router-dom";

export default function About() {
  const location = useLocation();
  const backTo = location.state?.from || "/";

  return (
    <>
      <Header />

      <div className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10">
        <BackButton
          to={backTo}
          title="About CvSU Agri-Eco Tourism Park"
          description="Discover our mission, vision, and values."
        />

        <div className="relative h-50 bg-[url('/images/homepage.png')] bg-cover bg-bottom bg-no-repeat rounded-xl flex flex-col items-center justify-center text-center gap-3 shadow-2xl overflow-hidden text-white">
          <div className="absolute inset-0 bg-white/20" />
          <h1 className="font-bold text-5xl relative">Agri-Eco Tourism Park</h1>
          <p className="relative drop-shadow-lg">
            Discover our mission, vision, and values.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 my-10">
          <HeaderCard
            headerClass="bg-[#a9e2a3] text-[#227B05]"
            icon={<FontAwesomeIcon icon={faBuilding} />}
            title="CvSU Mission"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            className="bg-white col-span-2 md:col-span-1"
          />

          <HeaderCard
            headerClass="bg-blue-50 text-blue-900"
            icon={<FontAwesomeIcon icon={faEye} />}
            title="CvSU Vision"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            className="bg-white col-span-2 md:col-span-1"
          />

          <div className="col-span-2 rounded-xl border-0 shadow-sm overflow-hidden">
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

          <HeaderCard
            headerClass="bg-[#F5F3C9] text-[#ADA128]"
            icon={<FontAwesomeIcon icon={faBook} />}
            title="History"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            className="bg-white col-span-2"
          />

          <div className="col-span-2 rounded-xl border-0 shadow-sm overflow-hidden bg-white">
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

            {/* FAQ Items */}
            <div className="flex flex-col gap-5 p-5">
              <Faq
                number={1}
                question="What is Agri-Eco Tourism Park?"
                answer="Agri-Eco Tourism Park is a sustainable tourism destination that combines agriculture and ecological conservation."
              />
              <Faq
                number={2}
                question="What is Agri-Eco Tourism Park?"
                answer="Agri-Eco Tourism Park is a sustainable tourism destination that combines agriculture and ecological conservation."
              />
              <Faq
                number={3}
                question="What is Agri-Eco Tourism Park?"
                answer="Agri-Eco Tourism Park is a sustainable tourism destination that combines agriculture and ecological conservation."
              />
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-3 gap-5">
            <Link
              to="/operating-hours"
              state={{ from: location.pathname }}
              className="col-span-3 md:col-span-1"
            >
              <ValueCard
                title="Operating Hours"
                titleClasses="text-[#227B05] text-xl mb-3"
                description="Monday-Thursday"
                description2="8:00 AM - 5:00 PM"
                icon={<FontAwesomeIcon icon={faClock} className="text-4xl" />}
                iconClasses="text-[#227B05]"
                className="col-span-3 md:col-span-1 border-0 shadow-2xl"
              />
            </Link>

            <ValueCard
              title="Location"
              titleClasses="text-[#227B05] text-xl mb-3"
              description="Cavite State University"
              description2="Indang, Cavite"
              icon={
                <FontAwesomeIcon icon={faLocationDot} className="text-4xl" />
              }
              iconClasses="text-blue-900"
              className="col-span-3 md:col-span-1 border-0 shadow-2xl"
            />

            <ValueCard
              title="Contact"
              titleClasses="text-[#227B05] text-xl mb-3"
              description="(012) 345-6789"
              description2="agri-ecopark@cvsu.edu.ph"
              icon={<FontAwesomeIcon icon={faPhone} className="text-4xl" />}
              iconClasses="text-[#7942C2]"
              className="col-span-3 md:col-span-1 border-0 shadow-2xl"
            />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
