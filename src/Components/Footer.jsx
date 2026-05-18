import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faPhone,
  faBook,
  faBoxOpen,
  faMapLocationDot,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import { faEnvelope, faClock } from "@fortawesome/free-regular-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";

function Footer() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/contact`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setContacts(data);
          }
        }
      } catch (error) {
        console.error("Failed to load contacts:", error);
      }
    };
    fetchContacts();
  }, []);

  // Map contacts by contactName for easy access
  const contactMap = {};
  contacts.forEach((contact) => {
    contactMap[contact.contactName] = contact.value;
  });

  const contactNumber = contactMap["contactnumber"];
  const email = contactMap["email"];
  const facebookUrl = contactMap["facebook"];

  // Check if values exist (not from fallback)
  const hasContactNumber = contactMap["contactnumber"];
  const hasEmail = contactMap["email"];
  const hasFacebook = contactMap["facebook"];

  return (
    <footer className="border-t bg-[#227B05] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand + blurb */}
          <div className="space-y-3">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">CvSU Agri‑Eco Park</h2>
              <p className="text-xs text-green-100">Tourism Park</p>
            </div>
            <p className="text-xs leading-6 text-green-100">
              The establishment of the Agri-Eco Tourism Park is one of the
              University’s ways in bringing back the interest and appreciation
              of the people to agriculture by providing them with attractions,
              activities, services, amenities, and hands-on learning.
            </p>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="mb-4 text-base font-semibold">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="mt-1 text-white"
                  aria-hidden="true"
                />
                <p className="text-sm text-green-100">
                  Cavite State University, Indang, Cavite, Philippines
                </p>
              </li>
              {hasContactNumber && (
                <li className="flex items-start gap-3">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="mt-1 text-white"
                    aria-hidden="true"
                  />
                  <a
                    href={`tel:${contactNumber}`}
                    className="text-sm text-green-100 hover:text-white hover:underline"
                  >
                    {contactNumber}
                  </a>
                </li>
              )}
              {hasEmail && (
                <li className="flex items-start gap-3">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="mt-1 text-white"
                    fixedWidth
                    aria-hidden="true"
                  />
                  <a
                    href={`mailto:${email}`}
                    className="text-sm text-green-100 hover:text-white hover:underline"
                  >
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="mb-4 text-base font-semibold">Operating Hours</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faClock}
                  className="mt-1 text-white"
                  aria-hidden="true"
                />
                <div className="text-sm text-green-100">
                  <p>Monday – Thursday</p>
                  <p>7:00 AM – 6:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faClock}
                  className="mt-1 text-white"
                  aria-hidden="true"
                />
                <div className="text-sm text-green-100">
                  <p>Friday</p>
                  <p>7:00 AM – 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-3 text-base font-semibold">Connect with us</h3>
            <div className="flex flex-col gap-2 mb-5">
              <Link to="/about" className="text-sm">
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="text-white mr-2"
                />
                About the park
              </Link>
              <Link
                to="/packages-promos"
                state={{ from: location.pathname }}
                className="text-sm"
              >
                <FontAwesomeIcon icon={faBoxOpen} className="text-white mr-2" />
                Eco-park Service packages
              </Link>
              <Link to="/#map" className="text-sm">
                <FontAwesomeIcon
                  icon={faMapLocationDot}
                  className="text-white mr-2"
                />
                Explore our Attractions
              </Link>
              <a href="/book" className="text-sm">
                <FontAwesomeIcon icon={faBook} className="text-white mr-2" />
                Solo or Group bookings
              </a>
            </div>
            <div className="flex items-center gap-4">
              {hasFacebook && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="CvSU Agri‑Eco Park on Facebook"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 shadow hover:bg-white/20"
                >
                  <FontAwesomeIcon icon={faFacebook} className="text-white" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-center text-xs text-green-100">
          © {new Date().getFullYear()} CvSU Agri‑Eco Park. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
