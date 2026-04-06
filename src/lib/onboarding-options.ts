const ROLE_OPTIONS = [
  "Business Owner/Leader",
  "Head of Department - HR/Talent",
  "Head of Department - Other",
  "Director - HR/Talent",
  "Director - Other",
  "Manager - HR/Talent",
  "Manager - Other",
  "Social Media Manager",
  "Recruiter/Sourcer",
  "Student/Intern",
  "Job Seeker",
  "Other",
] as const;

// Based on standard region codes, filtered to selectable country/territory entries.
const COUNTRY_REGION_CODES = `
AC AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ
BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CP CQ CR CU CV CW CX CY CZ
DE DG DJ DK DM DO DZ
EA EC EE EG EH ER ES ET
FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
HK HM HN HR HT HU
IC ID IE IL IM IN IO IQ IR IS IT
JE JM JO JP
KE KG KH KI KM KN KP KR KW KY KZ
LA LB LC LI LK LR LS LT LU LV LY
MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
NA NC NE NF NG NI NL NO NP NR NU NZ
OM
PA PE PF PG PH PK PL PM PN PR PS PT PW PY
QA
RE RO RS RU RW
SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
TA TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ
UA UG UM US UY UZ
VA VC VE VG VI VN VU
WF WS
YE YT
ZA ZM ZW
`
  .trim()
  .split(/\s+/);

const regionDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });

const COUNTRY_REGION_OPTIONS = COUNTRY_REGION_CODES.map((code) => {
  const name = regionDisplayNames.of(code);

  return name && name !== code ? name : null;
})
  .filter((name): name is string => Boolean(name))
  .sort((left, right) =>
    left.localeCompare(right, "en", { sensitivity: "base" }),
  );

export { COUNTRY_REGION_OPTIONS, ROLE_OPTIONS };
