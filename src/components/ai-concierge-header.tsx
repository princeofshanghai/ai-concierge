import Image from "next/image";

function HeaderIconButton({
  ariaLabel,
  height,
  iconSrc,
  onClick,
  width,
}: {
  ariaLabel: string;
  height: number;
  iconSrc: string;
  onClick?: () => void;
  width: number;
}) {
  const sharedClassName =
    "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-linkedin-blue";

  if (onClick) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        className={sharedClassName}
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
    <span aria-hidden="true" className={sharedClassName}>
      <Image src={iconSrc} alt="" width={width} height={height} />
    </span>
  );
}

type AiConciergeHeaderProps = {
  onClose: () => void;
};

export function AiConciergeHeader({ onClose }: AiConciergeHeaderProps) {
  return (
    <header className="flex items-center justify-between overflow-clip border-b border-black/10 pl-5 pr-4 py-4 sm:rounded-t-[24px]">
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
        <HeaderIconButton
          ariaLabel="More options"
          height={3}
          iconSrc="/figma/chat/overflow.svg"
          width={13}
        />
        <HeaderIconButton
          ariaLabel="Maximize panel"
          height={14}
          iconSrc="/figma/chat/maximize.svg"
          width={14}
        />
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
