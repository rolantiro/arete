import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="tracked text-[11px] text-[var(--color-grey-500)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full border border-[var(--color-grey-300)] bg-transparent px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-grey-500)] transition-colors focus:border-[var(--color-ink)] focus:outline-none",
            error && "border-[var(--color-error)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="tracked text-[11px] text-[var(--color-grey-500)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full border border-[var(--color-grey-300)] bg-transparent px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-grey-500)] transition-colors focus:border-[var(--color-ink)] focus:outline-none resize-none",
            error && "border-[var(--color-error)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
