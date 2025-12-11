import Footer from "../Components/Footer";
import Header from "../Components/Header";
import HeaderCard from "../Components/HeaderCard.jsx";

import { useLocation } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";

import { faNoteSticky } from "@fortawesome/free-regular-svg-icons";

import BackButton from "../Components/BackButton.jsx";

function OperatingHours() {
  const location = useLocation();
  const backTo = location.state?.from || "/";

  return (
    <>
      <Header />
      <div className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10 flex flex-col gap-5">
        <BackButton
          to={backTo}
          title="Operating Hours and Schedule"
          description="Plan your visit with our detailed schedule information"
        />

        <div className="grid grid-cols-3 gap-5">
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
              <ul className="list-disc pl-5 space-y-1 marker:text-[#48BF56] my-5 mx-10">
                <li>Monday - Friday: 8 AM - 5 PM</li>
                <li>Last entry: 4 PM</li>
                <li>Gates close promptly at 5 PM</li>
              </ul>
            }
            className="bg-white col-span-3 md:col-span-1"
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
              <ul className="list-disc pl-5 space-y-1 marker:text-[#48BF56] my-5 mx-10">
                <li>Busiest Time: 10 AM - 2 PM</li>
                <li>Ideal for group activities</li>
                <li>All facilities are fully operational</li>
              </ul>
            }
            className="bg-white col-span-3 md:col-span-1"
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
              <ul className="list-disc pl-5 space-y-1 marker:text-[#48BF56] my-5 mx-10">
                <li>Early Morning: 8 AM - 10 AM</li>
                <li>Late Afternoon: 3 PM - 5 PM</li>
                <li>Perfect for peaceful operations</li>
              </ul>
            }
            className="bg-white col-span-3 md:col-span-1"
          />
        </div>

        <div>
          <HeaderCard
            className="bg-[#FDDB3C]/10"
            headerClass="text-[#97750B]"
            icon={
              <FontAwesomeIcon icon={faNoteSticky} className="text-[#E32726]" />
            }
            title="Important Reminders"
            descriptionContent={
              <div className="grid grid-cols-2 gap-2 md:gap-5 my-5 mx-10">
                <ul className="list-disc pl-5 space-y-1 col-span-2 md:col-span-1 grid gap-2">
                  <li>
                    Advance booking is highly recommended, especially for groups
                  </li>
                  <li>
                    Last entry is at 4:00 PM to ensure you have enough time to
                    explore
                  </li>
                  <li>
                    During peak hours (10 AM - 2 PM), expect larger crowds
                  </li>
                  <li>Special events may affect regular operating hours</li>
                  <li>Weather conditions may impact outdoor activities</li>
                </ul>
                <ul className="list-disc pl-5 space-y-1 col-span-2 md:col-span-1 grid gap-2">
                  <li>
                    Advance booking is highly recommended, especially for groups
                  </li>
                  <li>
                    Last entry is at 4:00 PM to ensure you have enough time to
                    explore
                  </li>
                  <li>
                    During peak hours (10 AM - 2 PM), expect larger crowds
                  </li>
                  <li>Special events may affect regular operating hours</li>
                  <li>Weather conditions may impact outdoor activities</li>
                </ul>
              </div>
            }
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default OperatingHours;
