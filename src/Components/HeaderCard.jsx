function AboutCard({
  headerClass = "bg-white text-black",
  icon,
  title,
  subtitle,
  descriptionClass,
  description,
  descriptionContent,
  className,
}) {
  return (
    <div
      className={`bg-white rounded-xl border-0 shadow-sm overflow-hidden m-5 flex flex-col h-full ${className}`}
    >
      <header className={`flex px-10 py-5 gap-3 ${headerClass} `}>
        <span className="text-lg lg:text-xl my-auto">{icon}</span>
        <div className="my-auto">
          <h1 className="font-bold text-lg lg:text-xl">{title}</h1>
          <h6 className="font-bold text-xs lg:text-sm">{subtitle}</h6>
        </div>
      </header>

      <div className={`px-10 py-5 ${descriptionClass}`}>
        {descriptionContent ? descriptionContent : description}
      </div>
    </div>
  );
}

export default AboutCard;
