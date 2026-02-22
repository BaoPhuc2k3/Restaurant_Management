import "../../styles/ui.css";

export default function Button({ children, ...rest }) {
  return (
    <button className="flex items-center justify-center gap-2 w-full px-3.5 py-3 rounded-lg font-semibold cursor-pointer border border-[#dadada] bg-[#ff7b00] text-white hover:bg-[#ff6a00]" {...rest}>
      {children}
    </button>
  );
}
