export default function InputWithIcon({
  icon,
  className = "",
  ...props
}) {
  return (
    <div className="relative w-full mb-3.5">
      <span className="
        absolute left-3 top-1/2 -translate-y-1/2
        text-gray-500 pointer-events-none
      ">
        {icon}
      </span>

      <input
        className={`
          w-full bg-[#efebeb]
          pl-10 pr-3.5 py-3
          rounded-[10px]
          border border-[#ddd]
          text-[15px]
          focus:outline-none focus:border-[#ff7b00]
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
