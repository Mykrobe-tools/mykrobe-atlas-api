const Phenotyping = {
  title: "Phenotyping",
  type: "object",
  properties: {
    phenotypeInformationFirstLineDrugs: {
      title: "Phenotype Information First Line Drugs",
      type: "string",
      enum: ["Yes", "No"]
    },
    rifampicin: {
      title: "Rifampicin",
      $ref: "#/definitions/Susceptibility"
    },
    ethambutol: {
      title: "Ethambutol",
      $ref: "#/definitions/Susceptibility"
    },
    pyrazinamide: {
      title: "Pyrazinamide",
      $ref: "#/definitions/Susceptibility"
    },
    isoniazid: {
      title: "Isoniazid",
      $ref: "#/definitions/Susceptibility"
    },
    phenotypeInformationOtherDrugs: {
      title: "Phenotype Information Other Drugs",
      type: "boolean"
    },
    rifabutin: {
      title: "Rifabutin",
      $ref: "#/definitions/Susceptibility"
    },
    ofloxacin: {
      title: "Ofloxacin",
      $ref: "#/definitions/Susceptibility"
    },
    ciprofloxacin: {
      title: "Ciprofloxacin",
      $ref: "#/definitions/Susceptibility"
    },
    levofloxacin: {
      title: "Levofloxacin",
      $ref: "#/definitions/Susceptibility"
    },
    gatifloxacin: {
      title: "Gatifloxacin",
      $ref: "#/definitions/Susceptibility"
    },
    amikacin: {
      title: "Amikacin",
      $ref: "#/definitions/Susceptibility"
    },
    kanamycin: {
      title: "Kanamycin",
      $ref: "#/definitions/Susceptibility"
    },
    gentamicin: {
      title: "Gentamicin",
      $ref: "#/definitions/Susceptibility"
    },
    streptomycin: {
      title: "Streptomycin",
      $ref: "#/definitions/Susceptibility"
    },
    capreomycin: {
      title: "Capreomycin",
      $ref: "#/definitions/Susceptibility"
    },
    clofazimine: {
      title: "Clofazimine",
      $ref: "#/definitions/Susceptibility"
    },
    pas: {
      title: "PAS",
      $ref: "#/definitions/Susceptibility"
    },
    linezolid: {
      title: "Linezolid",
      $ref: "#/definitions/Susceptibility"
    },
    ethionamideProthionamide: {
      title: "Ethionamide/Prothionamide",
      $ref: "#/definitions/Susceptibility"
    },
    rerizidone: {
      title: "Terizidone",
      $ref: "#/definitions/Susceptibility"
    },
    amoxicilinClavulanate: {
      title: "Amoxicilin/Clavulanate",
      $ref: "#/definitions/Susceptibility"
    },
    thioacetazone: {
      title: "Thioacetazone",
      $ref: "#/definitions/Susceptibility"
    },
    imipenemImipenemcilastatin: {
      title: "Imipenem/Imipenemcilastatin",
      $ref: "#/definitions/Susceptibility"
    },
    meropenem: {
      title: "Meropenem",
      $ref: "#/definitions/Susceptibility"
    },
    clarythromycin: {
      title: "Clarythromycin",
      $ref: "#/definitions/Susceptibility"
    },
    highDoseIsoniazid: {
      title: "High-dose Isoniazid",
      $ref: "#/definitions/Susceptibility"
    },
    bedaquiline: {
      title: "Bedaquiline",
      $ref: "#/definitions/Susceptibility"
    },
    delamanid: {
      title: "Delamanid",
      $ref: "#/definitions/Susceptibility"
    },
    prothionamide: {
      title: "Prothionamide",
      $ref: "#/definitions/Susceptibility"
    },
    pretothionamide: {
      title: "Pretothionamide",
      $ref: "#/definitions/Susceptibility"
    },
    pretomanid: {
      title: "Pretomanid (PA-824)",
      $ref: "#/definitions/Susceptibility"
    }
  }
};

export { Phenotyping };
