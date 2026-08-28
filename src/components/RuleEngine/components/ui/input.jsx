import { cn } from "./utils";
function Input({ className, type, ...props }) {
  return <input
    type={type}
    data-slot="input"
    className={cn(
      "file:text-black placeholder:text-slate-400 border-slate-300 flex h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-base bg-white text-black font-medium transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      "focus-visible:border-blue-500 focus-visible:ring-blue-500/50 focus-visible:ring-[2px]",
      "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
      className
    )}
    {...props}
  />;
}
export { Input };
