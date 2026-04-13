"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PrototypeLinkedInSignInScreen } from "@/components/prototype-linkedin-sign-in-screen";
import {
  completePrototypeLinkedInAuth,
  getPrototypeLinkedInSuggestedAccountId,
  PROTOTYPE_LINKEDIN_AUTH_RETURN_PARAM,
  readPrototypeLinkedInAuthState,
} from "@/lib/prototype-linkedin-auth";

export default function PrototypeLinkedInSignInPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authState = readPrototypeLinkedInAuthState();

  const defaultAccountId = useMemo(
    () => getPrototypeLinkedInSuggestedAccountId(authState),
    [authState],
  );

  return (
    <PrototypeLinkedInSignInScreen
      defaultAccountId={defaultAccountId}
      isSubmitting={isSubmitting}
      onSubmit={(accountId) => {
        const completedState = completePrototypeLinkedInAuth(accountId);
        const returnPath = completedState?.returnPath ?? "/";
        const returnUrl = new URL(returnPath, window.location.origin);

        returnUrl.searchParams.set(PROTOTYPE_LINKEDIN_AUTH_RETURN_PARAM, "success");
        setIsSubmitting(true);
        window.setTimeout(() => {
          router.push(`${returnUrl.pathname}${returnUrl.search}${returnUrl.hash}`);
        }, 650);
      }}
    />
  );
}
