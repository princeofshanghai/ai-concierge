import {
  PremiumSurveyPage,
  type PremiumSurveyCandidate,
  type PremiumSurveyEntryVariant,
} from "@/components/premium-survey-page";

type PremiumSurveyPageProps = {
  searchParams: Promise<{
    candidate?: string | string[] | undefined;
    launcher?: string | string[] | undefined;
    variant?: string | string[] | undefined;
  }>;
};

function getFirstQueryValue(
  queryValue: string | string[] | undefined,
) {
  return Array.isArray(queryValue) ? queryValue[0] : queryValue;
}

function resolvePremiumSurveyPrototypeMode({
  candidateParam,
  launcherParam,
  variantParam,
}: {
  candidateParam: string | string[] | undefined;
  launcherParam: string | string[] | undefined;
  variantParam: string | string[] | undefined;
}): {
  candidate: PremiumSurveyCandidate;
  entryVariant: PremiumSurveyEntryVariant;
} {
  const rawCandidate = getFirstQueryValue(candidateParam);
  const rawLauncher = getFirstQueryValue(launcherParam);
  const rawVariant = getFirstQueryValue(variantParam);

  if (
    rawVariant === "inline-help" ||
    rawVariant === "selection-nudge" ||
    rawVariant === "companion"
  ) {
    return {
      candidate: "candidate-1",
      entryVariant: rawVariant,
    };
  }

  if (rawCandidate === "3" || rawCandidate === "candidate-3") {
    return {
      candidate: "candidate-1",
      entryVariant: "inline-help",
    };
  }

  if (rawLauncher === "bubble" || rawLauncher === "candidate-3") {
    return {
      candidate: "candidate-1",
      entryVariant: "inline-help",
    };
  }

  if (
    rawCandidate === "2" ||
    rawCandidate === "candidate-2" ||
    rawCandidate === "consultative"
  ) {
    return {
      candidate: "candidate-2",
      entryVariant: "inline-help",
    };
  }

  return {
    candidate: "candidate-1",
    entryVariant: "companion",
  };
}

export default async function PremiumSurveyPrototypePage({
  searchParams,
}: PremiumSurveyPageProps) {
  const resolvedSearchParams = await searchParams;
  const { candidate, entryVariant } = resolvePremiumSurveyPrototypeMode({
    candidateParam: resolvedSearchParams.candidate,
    launcherParam: resolvedSearchParams.launcher,
    variantParam: resolvedSearchParams.variant,
  });

  return (
    <PremiumSurveyPage
      key={`${candidate}-${entryVariant}`}
      candidate={candidate}
      entryVariant={entryVariant}
    />
  );
}
