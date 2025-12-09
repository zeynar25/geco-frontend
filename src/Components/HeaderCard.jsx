function AboutCard({
  headerClass = "bg-white text-black",
  icon,
  title,
  description,
  descriptionContent,
  className,
}) {
  return (
    <div
      className={`bg-white rounded-xl border-0 shadow-sm overflow-hidden m-5 ${className}`}
    >
      <header className={`${headerClass} flex items-center px-10 py-5 gap-3`}>
        <span className="text-lg lg:text-xl">{icon}</span>
        <h1 className="font-bold text-lg lg:text-xl">{title}</h1>
      </header>

      <div className="px-10 py-5 flex items-center bg-white">
        {descriptionContent ? descriptionContent : description}
      </div>
    </div>
  );
}

export default AboutCard;
