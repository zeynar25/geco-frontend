import Footer from "../Components/Footer";
import Header from "../Components/Header";

import BackButton from "../Components/BackButton";

function PackagesPromos() {
  return (
    <>
      <Header />
      <div className="bg-green-50 px-20 py-10">
        <BackButton
          to="/book"
          title="Operating Hours and Schedule"
          description="Plan your visit with our detailed schedule information"
        />
      </div>
      <Footer />
    </>
  );
}

export default PackagesPromos;
