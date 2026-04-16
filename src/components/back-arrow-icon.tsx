type BackArrowIconProps = {
  className?: string;
};

export function BackArrowIcon({ className = "" }: BackArrowIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={["shrink-0", className].filter(Boolean).join(" ")}
    >
      <path
        d="M4.6 3L1 8L4.6 13H7L4.2 9H14V7H4.2L7 3H4.6Z"
        fill="currentColor"
      />
    </svg>
  );
}
