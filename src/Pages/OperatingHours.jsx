import Footer from "../Components/Footer";
import Header from "../Components/Header";

import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";

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
      </div>
      <Footer />
    </>
  );
}

export default OperatingHours;
