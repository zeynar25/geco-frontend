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

function Footer() {
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
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sapiente
              quas error accusamus, sunt similique ducimus. Laboriosam dicta eos
              sint eligendi explicabo architecto, blanditiis possimus facilis
              consequatur aut ipsum debitis repudiandae.
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
              <li className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="mt-1 text-white"
                  aria-hidden="true"
                />
                <a
                  href="tel:0123456789"
                  className="text-sm text-green-100 hover:text-white hover:underline"
                >
                  (012) 345-6789
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="mt-1 text-white"
                  fixedWidth
                  aria-hidden="true"
                />
                <a
                  href="mailto:agri-ecopark@cvsu.edu.ph"
                  className="text-sm text-green-100 hover:text-white hover:underline"
                >
                  agri-ecopark@cvsu.edu.ph
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="mb-4 text-base font-semibold">Operating Hours</h3>
            <div className="flex items-start gap-3">
              <FontAwesomeIcon
                icon={faClock}
                className="mt-1 text-white"
                aria-hidden="true"
              />
              <div className="text-sm text-green-100">
                <p>Monday – Thursday</p>
                <p>7:00 AM – 5:00 PM</p>
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
              <a href="#" className="text-sm">
                <FontAwesomeIcon icon={faBook} className="text-white mr-2" />
                Solo or Group bookings
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com/cvsuagriecopark"
                target="_blank"
                rel="noreferrer"
                aria-label="CvSU Agri‑Eco Park on Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 shadow hover:bg-white/20"
              >
                <FontAwesomeIcon icon={faFacebook} className="text-white" />
              </a>
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
