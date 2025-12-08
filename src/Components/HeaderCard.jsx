function AboutCard({
  headerBg = "bg-white",
  headerColor = "text-black",
  icon,
  title,
  description,
  className,
}) {
  return (
    <div
      className={`rounded-xl border-0 shadow-sm overflow-hidden m-5 ${className}`}
    >
      <header
        className={`${headerBg} ${headerColor} flex items-center px-10 py-5 gap-3`}
      >
        <span className="text-xl">{icon}</span>
        <h1 className="font-bold text-xl">{title}</h1>
      </header>
      <div className="px-10 py-5 flex items-center bg-white">{description}</div>
    </div>
  );
}

export default AboutCard;
