import Footer from "../Components/Footer";
import Header from "../Components/Header";
import BackButton from "../Components/BackButton";

import { useLocation, Link } from "react-router-dom";

function PackagesPromos() {
  const location = useLocation();
  const backTo = location.state?.from || "/";

  return (
    <>
      <Header />
      <div className="bg-green-50 px-20 py-10">
        <BackButton
          to={backTo}
          title="Operating Hours and Schedule"
          description="Plan your visit with our detailed schedule information"
        />
      </div>
      <Footer />
    </>
  );
}

export default PackagesPromos;
