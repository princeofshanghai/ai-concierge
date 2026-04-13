"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import { FormTextField } from "@/components/form-fields";
import {
  getDemoLinkedInAccountByEmail,
  getDemoLinkedInAccountById,
  type DemoLinkedInAccountId,
} from "@/lib/ai-concierge-fixtures";

type PrototypeLinkedInSignInScreenProps = {
  defaultAccountId: DemoLinkedInAccountId;
  isEmbeddedPreview?: boolean;
  isSubmitting?: boolean;
  onSubmit: (accountId: DemoLinkedInAccountId) => void;
};

export function PrototypeLinkedInSignInScreen({
  defaultAccountId,
  isEmbeddedPreview = false,
  isSubmitting = false,
  onSubmit,
}: PrototypeLinkedInSignInScreenProps) {
  const defaultAccount = useMemo(
    () => getDemoLinkedInAccountById(defaultAccountId),
    [defaultAccountId],
  );
  const [email, setEmail] = useState(defaultAccount.linkedInIdentity.email);
  const [password, setPassword] = useState("password");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(true);

  return (
    <div className="bg-white">
      <div
        className={[
          "flex flex-col px-6 pb-12 pt-7 sm:px-8",
          isEmbeddedPreview ? "min-h-[760px]" : "min-h-screen",
        ].join(" ")}
      >
        <div className="flex w-full justify-start">
          <LinkedInWordmark />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="flex w-full max-w-[332px] flex-col gap-4 sm:max-w-[352px]">
            <div className="rounded-[12px] border border-[rgba(10,102,194,0.18)] bg-[rgba(10,102,194,0.06)] px-4 py-3 text-center">
              <p className="ai-type-body-sm text-ai-text-primary">
                Demo only: this is a fake LinkedIn sign-in screen used to
                simulate the auth handoff in the prototype.
              </p>
            </div>

            <div className="rounded-[16px] border border-black/5 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-7">
              <h1 className="font-panel-text text-[32px] leading-[1.1] font-bold tracking-[-0.03em] text-black">
                Sign in
              </h1>

              <form
                className="mt-5 flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  onSubmit(
                    getDemoLinkedInAccountByEmail(email, defaultAccountId).id,
                  );
                }}
              >
                <FormTextField
                  label="Email or phone"
                  autoComplete="username"
                  value={email}
                  onValueChange={setEmail}
                  placeholder="Email or phone"
                />
                <FormTextField
                  label="Password"
                  autoComplete="current-password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onValueChange={setPassword}
                  placeholder="Password"
                  trailingAdornment={
                    <button
                      type="button"
                      onClick={() =>
                        setIsPasswordVisible((currentValue) => !currentValue)
                      }
                      className="ai-type-heading-sm text-ai-blue-primary transition-colors hover:text-ai-blue-hover"
                    >
                      {isPasswordVisible ? "Hide" : "Show"}
                    </button>
                  }
                />

                <button
                  type="button"
                  className="ai-type-heading-sm w-fit text-ai-blue-primary transition-colors hover:text-ai-blue-hover"
                >
                  Forgot password?
                </button>

                <label className="flex items-center gap-3">
                  <input
                    checked={keepMeLoggedIn}
                    className="h-4 w-4 rounded border-ai-border-strong text-ai-blue-primary focus:ring-ai-blue-primary"
                    onChange={(event) => setKeepMeLoggedIn(event.target.checked)}
                    type="checkbox"
                  />
                  <span className="ai-type-body-sm text-ai-text-primary">
                    Keep me logged in
                  </span>
                </label>

                <Button fullWidth disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <p className="ai-type-body-md-open text-center text-ai-text-primary">
          New to LinkedIn?{" "}
          <span className="ai-type-body-md-open font-semibold text-ai-blue-primary">
            Join now
          </span>
        </p>
      </div>
    </div>
  );
}

function LinkedInWordmark() {
  return (
    <Image
      src="/prototype/linkedin-logo-34.svg"
      alt="LinkedIn"
      width={135}
      height={34}
      priority
      className="h-[34px] w-auto"
    />
  );
}
