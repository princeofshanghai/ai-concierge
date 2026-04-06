type PhoneCallIconProps = {
  className?: string;
};

export function PhoneCallIcon({
  className = "h-5 w-5",
}: PhoneCallIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M21.7 17.7L18.6 14.6C18.2 14.2 17.5 14.2 17.1 14.6L15.3 16.4C12 14.6 9.4 12 7.6 8.7L9.4 6.9C9.8 6.5 9.8 5.8 9.4 5.4L6.3 2.3C5.9 1.9 5.3 1.9 4.9 2.3L2.9 4.2C2 5.1 1.8 6.4 2.2 7.6C3.5 10.9 5.4 13.8 7.8 16.2C10.2 18.6 13.1 20.5 16.4 21.8C17.5 22.3 18.9 22 19.7 21.1L21.6 19.2C22.1 18.8 22.1 18.1 21.7 17.7Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
}
