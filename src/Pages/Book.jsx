import Footer from "../Components/Footer";
import Header from "../Components/Header";
import ValueCard from "../Components/ValueCard.jsx";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faBoxOpen,
  faCalendar,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

function Book() {
  return (
    <>
      <Header />

      <div className="bg-green-50 px-20 py-10">
        <div className="flex items-center gap-3 mb-10">
          <Link to="/">
            <FontAwesomeIcon
              icon={faArrowLeftLong}
              className="text-black border rounded-sm p-2 hover:text-green-600"
            />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-bold text-xl text-[#227B05]">
              Book Your Visit
            </h1>
            <p>Reserve your spot at CvSU Agri-Eco Tourism Park</p>
          </div>
        </div>
        <div className="col-span-2 grid grid-cols-3 gap-5 m-5">
          <ValueCard
            title="Operating Hours"
            titleClasses="text-[#227B05] text-xl mb-3"
            description="Monday-Thursday"
            description2="8:00 AM - 5:00 PM"
            icon={<FontAwesomeIcon icon={faClock} className="text-4xl" />}
            iconClasses="text-[#227B05]"
            className="col-span-3 md:col-span-1 border-0 shadow-2xl"
          />

          <ValueCard
            title="Packages & Promos"
            titleClasses="text-[#227B05] text-xl mb-3"
            description="Various packages available"
            description2="Starting from P100"
            icon={<FontAwesomeIcon icon={faBoxOpen} className="text-4xl" />}
            iconClasses="text-blue-900"
            className="col-span-3 md:col-span-1 border-0 shadow-2xl"
          />

          <ValueCard
            title="Park Calendar"
            titleClasses="text-[#227B05] text-xl mb-3"
            description="Check availability"
            icon={<FontAwesomeIcon icon={faCalendar} className="text-4xl" />}
            iconClasses="text-[#7942C2]"
            className="col-span-3 md:col-span-1 border-0 shadow-2xl"
          />
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Book;
