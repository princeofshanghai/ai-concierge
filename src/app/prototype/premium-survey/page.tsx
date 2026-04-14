import {
  PremiumSurveyPage,
  type PremiumSurveyCandidate,
  type PremiumSurveyLauncherVariant,
} from "@/components/premium-survey-page";

type PremiumSurveyPageProps = {
  searchParams: Promise<{
    candidate?: string | string[] | undefined;
    launcher?: string | string[] | undefined;
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
}: {
  candidateParam: string | string[] | undefined;
  launcherParam: string | string[] | undefined;
}): {
  candidate: PremiumSurveyCandidate;
  launcher: PremiumSurveyLauncherVariant;
} {
  const rawCandidate = getFirstQueryValue(candidateParam);
  const rawLauncher = getFirstQueryValue(launcherParam);

  if (rawCandidate === "3" || rawCandidate === "candidate-3") {
    return {
      candidate: "candidate-1",
      launcher: "bubble",
    };
  }

  if (rawLauncher === "bubble" || rawLauncher === "candidate-3") {
    return {
      candidate: "candidate-1",
      launcher: "bubble",
    };
  }

  if (
    rawCandidate === "2" ||
    rawCandidate === "candidate-2" ||
    rawCandidate === "consultative"
  ) {
    return {
      candidate: "candidate-2",
      launcher: "default",
    };
  }

  return {
    candidate: "candidate-1",
    launcher: "default",
  };
}

export default async function PremiumSurveyPrototypePage({
  searchParams,
}: PremiumSurveyPageProps) {
  const resolvedSearchParams = await searchParams;
  const { candidate, launcher } = resolvePremiumSurveyPrototypeMode({
    candidateParam: resolvedSearchParams.candidate,
    launcherParam: resolvedSearchParams.launcher,
  });

  return (
    <PremiumSurveyPage
      key={`${candidate}-${launcher}`}
      candidate={candidate}
      launcher={launcher}
    />
  );
}
