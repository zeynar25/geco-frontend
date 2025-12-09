import Footer from "../Components/Footer";
import Header from "../Components/Header";
import HeaderCard from "../Components/HeaderCard.jsx";

import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import BackButton from "../Components/BackButton.jsx";

function OperatingHours() {
  return (
    <>
      <Header />
      <div className="bg-green-50 px-20 py-10">
        <BackButton
          to="/book"
          title="Operating Hours and Schedule"
          description="Plan your visit with our detailed schedule information"
        />

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
