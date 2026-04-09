type CloseIconProps = {
  className?: string;
};

export function CloseIcon({ className = "" }: CloseIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={["shrink-0", className].filter(Boolean).join(" ")}
    >
      <path
        d="M20 5.4L18.6 4L12 10.6L5.4 4L4 5.4L10.6 12L4 18.6L5.4 20L12 13.4L18.6 20L20 18.6L13.4 12L20 5.4Z"
        fill="currentColor"
      />
    </svg>
  );
}
