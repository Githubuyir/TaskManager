import * as React from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: "bg-brand-primary text-brand-on-primary hover:scale-[1.02] active:scale-[0.98] shadow-brand-ambient",
      secondary: "bg-brand-surface-container-highest text-brand-on-surface hover:bg-brand-surface-container-high",
      tertiary: "bg-transparent border border-brand-outline-variant/30 text-brand-on-surface hover:bg-brand-surface-container-low",
      ghost: "bg-transparent text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-brand-surface-container-low",
      error: "bg-brand-error text-white hover:bg-brand-error/90"
    };

    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-5 text-sm",
      lg: "h-14 px-8 text-base"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-brand-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-brand-lg bg-brand-surface-container-high px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-on-surface-variant/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:bg-brand-surface-container-lowest transition-all border border-transparent focus:border-brand-primary/30",
            error && "border-brand-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium text-brand-error">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Button, Input };
export { Modal } from "./Modal";
