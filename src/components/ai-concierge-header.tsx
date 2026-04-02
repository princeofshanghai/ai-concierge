import Image from "next/image";

function HeaderIconButton({
  ariaLabel,
  className = "",
  height,
  iconSrc,
  onClick,
  pressed,
  width,
}: {
  ariaLabel: string;
  className?: string;
  height: number;
  iconSrc: string;
  onClick?: () => void;
  pressed?: boolean;
  width: number;
}) {
  const sharedClassName =
    "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-linkedin-blue";
  const buttonClassName = [sharedClassName, className].join(" ").trim();

  if (onClick) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={pressed}
        onClick={onClick}
        className={buttonClassName}
      >
        <Image
          src={iconSrc}
          alt=""
          width={width}
          height={height}
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <span aria-hidden="true" className={buttonClassName}>
      <Image src={iconSrc} alt="" width={width} height={height} />
    </span>
  );
}

type AiConciergeHeaderProps = {
  isExpanded: boolean;
  onClose: () => void;
  onToggleExpand?: () => void;
};

export function AiConciergeHeader({
  isExpanded,
  onClose,
  onToggleExpand,
}: AiConciergeHeaderProps) {
  return (
    <header
      className={[
        "flex items-center justify-between overflow-clip border-b border-black/10 pl-5 pr-4 py-4",
        isExpanded ? "sm:rounded-t-[32px]" : "sm:rounded-t-[24px]",
      ].join(" ")}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Image
          src="/figma/chat/signal-ai.svg"
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
        />
        <h2 className="font-panel-display truncate text-[20px] font-[600] leading-[125%] tracking-[0.38px] text-black/90">
          AI Concierge
        </h2>
      </div>
      <div className="ml-3 flex items-center gap-1">
        {onToggleExpand ? (
          <HeaderIconButton
            ariaLabel={isExpanded ? "Collapse panel" : "Maximize panel"}
            className="hidden sm:flex"
            height={14}
            iconSrc={
              isExpanded
                ? "/figma/chat/minimize.svg"
                : "/figma/chat/maximize.svg"
            }
            onClick={onToggleExpand}
            pressed={isExpanded}
            width={14}
          />
        ) : null}
        <HeaderIconButton
          ariaLabel="Close chat"
          height={12}
          iconSrc="/figma/chat/close.svg"
          onClick={onClose}
          width={12}
        />
      </div>
    </header>
  );
}
