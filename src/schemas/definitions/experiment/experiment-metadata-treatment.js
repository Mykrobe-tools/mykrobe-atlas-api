const Treatment = {
  title: "Treatment",
  type: "object",
  properties: {
    previousTbInformation: {
      title: "Previous Tbinformation",
      type: "string",
      enum: ["Yes", "No"]
    },
    recentMdrTb: {
      title: "Recent MDR TB",
      type: "string",
      enum: ["Yes", "No", "Not known"]
    },
    priorTreatmentDate: {
      title: "Prior Treatment Date",
      type: "string",
      format: "date-time"
    },
    tbProphylaxis: {
      title: "TB Prophylaxis",
      type: "string",
      enum: ["Yes", "No", "Not known"]
    },
    tbProphylaxisDate: {
      title: "TB Prophylaxis Date",
      type: "string",
      format: "date-time"
    },
    currentTbInformation: {
      title: "Current TB Information",
      type: "string",
      enum: ["Yes", "No"]
    },
    startProgrammaticTreatment: {
      title: "Start Programmatic Treatment",
      type: "string",
      enum: ["Yes", "No"]
    },
    intensiveStartDate: {
      title: "Intensive Start Date",
      type: "string",
      format: "date-time"
    },
    intensiveStopDate: {
      title: "Intensive Stop Date",
      type: "string",
      format: "date-time"
    },
    startProgrammaticContinuationTreatment: {
      title: "Start Programmatic Continuation Treatment",
      type: "string",
      enum: ["Yes", "No", "Not known"]
    },
    continuation: {
      title: "Continuation Start Date",
      $ref: "#/definitions/DrugPhase"
    },
    nonStandardTreatment: {
      title: "Non Standard Treatment",
      type: "string",
      enum: ["Yes", "No", "Not known"]
    },
    outsideStandardPhaseRifampicinRifabutin: {
      title: "Rifampicin/Rifabutin",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseEthambutol: {
      title: "Ethambutol",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhasePyrazinamide: {
      title: "Pyrazinamide",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseIsoniazid: {
      title: "Isoniazid",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseOfloxacin: {
      title: "Ofloxacin",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseMoxifloxacin: {
      title: "Moxifloxacin",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseLevofloxacin: {
      title: "Levofloxacin",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseGatifloxacin: {
      title: "Gatifloxacin",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseAmikacin: {
      title: "Amikacin",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseGentamicin: {
      title: "Gentamicin",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseStreptomycin: {
      title: "Streptomycin",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseCapreomycin: {
      title: "Capreomycin",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseClofazimine: {
      title: "Clofazimine",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhasePas: {
      title: "PAS",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseLinezolid: {
      title: "Linezolid",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseEthionamideProthionamide: {
      title: "Ethionamide/Prothionamide",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseTerizidone: {
      title: "Terizidone",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseAmoxicilinClavulanate: {
      title: "Amoxicilin/Clavulanate",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseThioacetazone: {
      title: "Thioacetazone",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseImipenemImipenemcilastatin: {
      title: "Imipenem/Imipenemcilastatin",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseMeropenem: {
      title: "Meropenem",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseClarythromycin: {
      title: "Clarythromycin",
      $ref: "#/definitions/DrugPhase"
    },
    outsideStandardPhaseHighDoseIsoniazid: {
      title: "High-dose Isoniazid",
      $ref: "#/definitions/DrugPhase"
    }
  }
};
export { Treatment };
