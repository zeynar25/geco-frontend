import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";

import { Link } from "react-router-dom";

function BackButton(props) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <Link to={`${props.to}`}>
        <FontAwesomeIcon
          icon={faArrowLeftLong}
          className="text-black border rounded-sm p-2 hover:text-green-600"
        />
      </Link>
      <div className="flex flex-col">
        <h1 className="font-bold text-xl text-[#227B05]">{props.title}</h1>
        <p>{props.description}</p>
      </div>
    </div>
  );
}

export default BackButton;
