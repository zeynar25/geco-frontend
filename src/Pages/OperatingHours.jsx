import Footer from "../Components/Footer";
import Header from "../Components/Header";
import HeaderCard from "../Components/HeaderCard.jsx";

import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong, faBuilding } from "@fortawesome/free-solid-svg-icons";

function OperatingHours() {
  return (
    <>
      <Header />
      <div className="bg-green-50 px-20 py-10">
        <div className="flex items-center gap-3 mb-10">
          <Link to="/book">
            <FontAwesomeIcon
              icon={faArrowLeftLong}
              className="text-black border rounded-sm p-2 hover:text-green-600"
            />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-bold text-xl text-[#227B05]">
              Operating Hours and Schedule
            </h1>
            <p>Plan your visit with our detailed schedule information</p>
          </div>
        </div>

        <div className="grid grid-cols-3">
          <HeaderCard
            headerBg="bg-[#a9e2a3]"
            headerColor="text-[#227B05]"
            icon={<FontAwesomeIcon icon={faBuilding} />}
            title="Regular Hours"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            className="col-span-3 md:col-span-1"
          />
          <HeaderCard
            headerBg="bg-[#a9e2a3]"
            headerColor="text-[#227B05]"
            icon={<FontAwesomeIcon icon={faBuilding} />}
            title="Peak Hours"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            className="col-span-3 md:col-span-1"
          />
          <HeaderCard
            headerBg="bg-[#a9e2a3]"
            headerColor="text-[#227B05]"
            icon={<FontAwesomeIcon icon={faBuilding} />}
            title="Quiet Hours"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            className="col-span-3 md:col-span-1"
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default OperatingHours;
