import { cn } from "./utils";
function Textarea({ className, ...props }) {
  return <textarea
    data-slot="textarea"
    className={cn(
      "resize-none border-slate-300 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/50 flex field-sizing-content min-h-16 w-full rounded-lg border bg-white px-3 py-2 text-base text-slate-800 transition-[color,box-shadow] outline-none focus-visible:ring-[2px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className
    )}
    {...props}
  />;
}
export { Textarea };
