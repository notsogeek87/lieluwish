"use client";

import { useFormStatus } from "react-dom";

/** Submit button that asks for confirmation first (destructive actions). */
export function ConfirmSubmitButton({
  children,
  message,
  className,
}: {
  children: React.ReactNode;
  message: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={`${className} disabled:opacity-60`}
    >
      {children}
    </button>
  );
}
