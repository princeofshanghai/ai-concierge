"use client";

import { Avatar } from "@/components/avatar";

type LinkedInIdentity = {
  avatarSrc?: string | null;
  email: string;
  firstName: string;
  lastName: string;
};

type LinkedInIdentityChipProps = {
  linkedInIdentity: LinkedInIdentity | null;
  onUseAnotherAccount: () => void;
};

function LinkedInIdentityChip({
  linkedInIdentity,
  onUseAnotherAccount,
}: LinkedInIdentityChipProps) {
  if (!linkedInIdentity) {
    return null;
  }

  const fullName =
    `${linkedInIdentity.firstName} ${linkedInIdentity.lastName}`.trim();

  return (
    <div className="flex w-full items-center gap-3 rounded-full border border-ai-divider-subtle bg-transparent px-3 py-2.5">
      <Avatar
        decorative
        name={fullName}
        seed={linkedInIdentity.email}
        size={32}
        src={linkedInIdentity.avatarSrc}
      />
      <div className="min-w-0 flex-1">
        <p className="ai-type-heading-sm truncate text-ai-text-primary">
          {fullName}
        </p>
        <p className="ai-type-body-xs truncate text-ai-text-meta">
          {linkedInIdentity.email}
        </p>
      </div>
      <button
        type="button"
        onClick={onUseAnotherAccount}
        className="ai-type-label-xs shrink-0 text-ai-blue-primary transition-colors hover:text-ai-blue-hover"
      >
        Not you?
      </button>
    </div>
  );
}

export { LinkedInIdentityChip };
export type { LinkedInIdentity };
