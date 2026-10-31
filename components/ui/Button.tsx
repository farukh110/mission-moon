import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
}

export function Button({ variant = "secondary", size = "md", className = "", type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={`btn btn-${variant} btn-${size} ${className}`} {...rest} />;
}
