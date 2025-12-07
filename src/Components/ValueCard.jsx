function StatisticCard({
  title,
  titleClasses,
  description,
  description2,
  descriptionClasses,
  icon,
  src,
  img_alt,
  className,
  bg = "bg-white",
  iconClasses,
}) {
  return (
    <div
      className={`rounded-xl border ${bg} shadow-sm p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg text-xl sm:text- ${iconClasses}`}
        >
          {icon ? (
            icon
          ) : src ? (
            <img
              src={src}
              alt={img_alt ?? ""}
              className="h-8 w-8 object-contain"
            />
          ) : null}
        </div>
        <div>
          <div
            className={`text-2xl font-extrabold leading-tight ${titleClasses}`}
          >
            {title}
          </div>
          <div className={`text-sm ${descriptionClasses}`}>
            <div>{description}</div>
            <div>{description2}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticCard;
