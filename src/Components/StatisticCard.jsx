function StatisticCard({
  value,
  label,
  icon,
  src,
  img_alt,
  className = "",
  bg = "bg-white",
  iconBg = "bg-green-50",
  iconColor = "text-green-600",
}) {
  return (
    <div
      className={`w-80 sm:w-auto rounded-xl border ${bg} shadow-sm p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg ${iconBg} ${iconColor} text-xl sm:text-2xl`}
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
          <div className="text-2xl font-extrabold leading-tight text-gray-900">
            {value}
          </div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default StatisticCard;
