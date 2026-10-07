/** Fictional recorded team work, not legal requirements or official processing targets. */
export const workflows = {
  assessment: {
    title: "Review CV and role brief",
    description:
      "HR has requested an initial assessment. Review the supplied CV, role description, and destination before recommending a route.",
    owner: "advisor",
  },
  missingCv: {
    title: "Provide CV and LinkedIn profile",
    description:
      "The initial assessment is waiting for the employee’s CV and profile link. No eligibility decision has been recorded.",
    owner: "employee",
  },
  roleBrief: {
    title: "Confirm proposed role details",
    description:
      "HR needs to confirm the job description, work location, and planned start date for advisor review.",
    owner: "hr",
  },
  documents: {
    title: "Provide outstanding documents",
    description:
      "The advisor has requested the outstanding identity and employment documents listed in the case notes.",
    owner: "employee",
  },
  employerReview: {
    title: "Review employer documents",
    description:
      "Review the employer information supplied by HR and record any outstanding questions.",
    owner: "advisor",
  },
  draft: {
    title: "Review application draft",
    description:
      "Review the prepared draft with the employee before submission. The application has not been filed.",
    owner: "advisor",
  },
  filing: {
    title: "Confirm filing receipt",
    description:
      "The application is recorded as filed. Add the filing confirmation to the case record.",
    owner: "advisor",
  },
  rfe: {
    title: "Prepare evidence for advisor review",
    description:
      "A request for evidence is recorded. This date is the team’s preparation target; the authority response deadline must be read from the actual notice.",
    owner: "hr",
  },
  passport: {
    title: "Update passport details",
    description:
      "Obtain the current passport information and check the recorded expiry dates. Do not assume that an outdated record establishes the employee’s current immigration position.",
    owner: "employee",
  },
  renewal: {
    title: "Review renewal plan",
    description:
      "Review the existing approval record and agree next steps with HR and the employee. This is an internal planning target, not a statutory filing deadline.",
    owner: "advisor",
  },
  statusCheck: {
    title: "Record a case status update",
    description:
      "Check the recorded filing and progress information and update the case. No decision date has been promised.",
    owner: "advisor",
  },
} as const;

export type Workflow = keyof typeof workflows;
