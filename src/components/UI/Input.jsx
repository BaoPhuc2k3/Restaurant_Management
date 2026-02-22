// import "../../styles/ui.css";

export default function Input({ className = "", ...props }) {
  return <input className={`w-full bg-[#efebeb] px-3.5 py-3 rounded-[10px] border border-[#ddd] mb-3.5 text-[15px] focus:outline-none focus:border-[#ff7b00] ${className}`} {...props} />;
}
