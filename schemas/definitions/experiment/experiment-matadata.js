const Metadata = {
  type: "object",
  title: "metadata",
  properties: {
    patientId: {
      title: "Patient Id",
      type: "string"
    },
    siteId: {
      title: "Site Id",
      type: "string"
    },
    genderAtBirth: {
      title: "Gender At Birth",
      type: "string"
    },
    countryOfBirth: {
      title: "Country Of Birth",
      type: "string"
    },
    bmi: {
      title: "BMI",
      type: "number"
    },
    injectingDrugUse: {
      title: "Injecting Drug Use",
      type: "string"
    },
    homeless: {
      title: "Homeless",
      type: "string"
    },
    imprisoned: {
      title: "Imprisoned",
      type: "string"
    },
    smoker: {
      title: "Smoker",
      type: "string"
    },
    diabetic: {
      title: "Diabetic",
      type: "string"
    },
    hivStatus: {
      title: "HIV Status",
      type: "string"
    },
    art: {
      title: "ART",
      type: "string"
    },
    labId: {
      title: "Lab Id",
      type: "string"
    },
    isolateId: {
      title: "Isolate Id",
      type: "string"
    },
    collectionDate: {
      title: "Collection Date",
      type: "string",
      format: "date-time"
    },
    prospectiveIsolate: {
      title: "Prospective Isolate",
      type: "boolean"
    },
    patientAge: {
      title: "Patient Age",
      type: "number"
    },
    countryIsolate: {
      title: "Country Isolate",
      type: "string"
    },
    cityIsolate: {
      title: "City Isolate",
      type: "string"
    },
    dateArrived: {
      title: "Date Arrived",
      type: "string",
      format: "date-time"
    },
    anatomicalOrigin: {
      title: "Anatomical Origin",
      type: "string"
    },
    smear: {
      title: "Smear",
      type: "string"
    },
    wgsPlatform: {
      title: "WGS Platform",
      type: "string"
    },
    wgsPlatformOther: {
      title: "WGS Platform Other",
      type: "string"
    },
    otherGenotypeInformation: {
      title: "Other Genotype Information",
      type: "boolean"
    },
    genexpert: {
      title: "Genexpert",
      type: "string"
    },
    hain: {
      title: "Hain",
      type: "string"
    },
    hainRif: {
      title: "Hain Rif",
      type: "string"
    },
    hainInh: {
      title: "Hain Inh",
      type: "string"
    },
    hainFl: {
      title: "Hain Fl",
      type: "string"
    },
    hainAm: {
      title: "Hain Am",
      type: "string"
    },
    hainEth: {
      title: "Hain Eth",
      type: "string"
    },
    phenotypeInformationFirstLineDrugs: {
      title: "Phenotype Information First Line Drugs",
      type: "boolean"
    },
    phenotypeInformationOtherDrugs: {
      title: "Phenotype Information Other Drugs",
      type: "boolean"
    },
    susceptibility: { $ref: "#/definitions/Susceptibility" },
    susceptibilityNotTestedReason: {
      $ref: "#/definitions/SusceptibilityNotTestedReason"
    },
    previousTbinformation: {
      title: "Previous Tbinformation",
      type: "boolean"
    },
    recentMdrTb: {
      title: "Recent Mdr Tb",
      type: "string"
    },
    priorTreatmentDate: {
      title: "Prior Treatment Date",
      type: "string",
      format: "date-time"
    },
    tbProphylaxis: {
      title: "TB Prophylaxis",
      type: "string"
    },
    tbProphylaxisDate: {
      title: "TB Prophylaxis Date",
      type: "string",
      format: "date-time"
    },
    currentTbinformation: {
      title: "Current Tbinformation",
      type: "boolean"
    },
    startProgrammaticTreatment: {
      title: "Start Programmatic Treatment",
      type: "boolean"
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
      type: "string"
    },
    continuationStartDate: {
      title: "Continuation Start Date",
      type: "string",
      format: "date-time"
    },
    continuationStopDate: {
      title: "Continuation Stop Date",
      type: "string",
      format: "date-time"
    },
    nonStandardTreatment: {
      title: "Non Standard Treatment",
      type: "string"
    },
    drugOutsidePhase: { $ref: "#/definitions/DrugOutsidePhase" },
    drugOutsidePhaseStartDate: {
      $ref: "#/definitions/DrugOutsidePhaseStartDate"
    },
    drugOutsidePhaseEndDate: { $ref: "#/definitions/DrugOutsidePhaseEndDate" },
    sputumSmearConversion: {
      title: "Sputum Smear Conversion",
      type: "string"
    },
    sputumCultureConversion: {
      title: "Sputum Culture Conversion",
      type: "string"
    },
    whoOutcomeCategory: {
      title: "Who Outcome Category",
      type: "string"
    },
    dateOfDeath: {
      title: "Date Of Death",
      type: "string",
      format: "date-time"
    }
  }
};

export { Metadata };
