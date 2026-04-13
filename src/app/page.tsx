import { RecruiterLandingPage } from "@/components/recruiter-landing-page";
import { PROTOTYPE_LINKEDIN_AUTH_RETURN_PARAM } from "@/lib/prototype-linkedin-auth";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const prototypeLinkedInAuthReturn =
    resolvedSearchParams[PROTOTYPE_LINKEDIN_AUTH_RETURN_PARAM];

  return (
    <RecruiterLandingPage
      initialPrototypeLinkedInAuthReturn={
        Array.isArray(prototypeLinkedInAuthReturn)
          ? prototypeLinkedInAuthReturn[0]
          : prototypeLinkedInAuthReturn
      }
    />
  );
}
