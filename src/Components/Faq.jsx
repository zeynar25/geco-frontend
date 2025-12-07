function Faq(props) {
  return (
    <div>
      <div className="flex items-center gap-2 m-5">
        <span className="font-bold bg-green-100 text-[#227B05] m-2 px-4 py-2 rounded-full">
          {props.number}
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-md">{props.question}</h2>
          <p>{props.answer}</p>
        </div>
      </div>
      <hr />
    </div>
  );
}

export default Faq;
