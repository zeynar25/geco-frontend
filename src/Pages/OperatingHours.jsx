import Footer from "../Components/Footer";
import Header from "../Components/Header";
import HeaderCard from "../Components/HeaderCard.jsx";

import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
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
            headerClass="bg-[#0A7A28] text-white"
            icon={
              <FontAwesomeIcon
                icon={faClock}
                className="bg-white/50 p-2 rounded-lg"
              />
            }
            title="Regular Hours"
            descriptionContent={
              <ul className="list-disc pl-5 space-y-1 marker:text-[#48BF56]">
                <li>Monday - Friday: 8 AM - 5 PM</li>
                <li>Last entry: 4 PM</li>
                <li>Gates close promptly at 5 PM</li>
              </ul>
            }
            className="col-span-3 md:col-span-1"
          />
          <HeaderCard
            headerClass="bg-[#E05A21] text-white"
            icon={
              <FontAwesomeIcon
                icon={faClock}
                className="bg-white/50 p-2 rounded-lg"
              />
            }
            title="Peak Hours"
            descriptionContent={
              <ul className="list-disc pl-5 space-y-1 marker:text-[#48BF56]">
                <li>Busiest Time: 10 AM - 2 PM</li>
                <li>Ideal for group activities</li>
                <li>All facilities are fully operational</li>
              </ul>
            }
            className="col-span-3 md:col-span-1"
          />
          <HeaderCard
            headerClass="bg-[#222EDA] text-white"
            icon={
              <FontAwesomeIcon
                icon={faClock}
                className="bg-white/50 p-2 rounded-lg"
              />
            }
            title="Quiet Hours"
            descriptionContent={
              <ul className="list-disc pl-5 space-y-1 marker:text-[#48BF56]">
                <li>Early Morning: 8 AM - 10 AM</li>
                <li>Late Afternoon: 3 PM - 5 PM</li>
                <li>Perfect for peaceful operations</li>
              </ul>
            }
            className="col-span-3 md:col-span-1"
          />
        </div>

        <div>
          <HeaderCard headerClass="bg-[#FDDB3C]" />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default OperatingHours;
