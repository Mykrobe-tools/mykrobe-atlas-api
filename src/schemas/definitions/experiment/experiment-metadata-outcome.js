const Outcome = {
  title: "Outcome",
  type: "object",
  properties: {
    sputumSmearConversion: {
      title: "Sputum Smear Conversion",
      type: "string",
      enum: [
        "Sputum smear negative at 2-3 months",
        "Sputum smear positive at 2-3 months",
        "Not known or not done"
      ]
    },
    sputumCultureConversion: {
      title: "Sputum Culture Conversion",
      type: "string",
      enum: [
        "Sputum smear negative at 2-3 months",
        "Sputum smear positive at 2-3 months",
        "Not known or not done"
      ]
    },
    whoOutcomeCategory: {
      title: "WHO Outcome Category",
      type: "string",
      enum: [
        "Cured",
        "Treatment completed",
        "Treatment failed",
        "Died",
        "Lost to follow-up or defaulted",
        "Not evaluated",
        "Treatment success",
        "Not known"
      ]
    },
    dateOfDeath: {
      title: "Date Of Death",
      type: "string",
      format: "date-time"
    }
  }
};
export { Outcome };
