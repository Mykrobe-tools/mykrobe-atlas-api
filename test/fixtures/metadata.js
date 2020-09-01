import moment from "moment";
const patients = {
  normal: {
    patientId: "eff2fa6a-9d79-41ab-a307-b620cedf7293",
    siteId: "a2a910e3-25ef-475c-bdf9-f6fe215d949f",
    genderAtBirth: "Male",
    countryOfBirth: "IN",
    age: 43,
    bmi: 25.3,
    injectingDrugUse: "No",
    homeless: "No",
    imprisoned: "No",
    smoker: "Yes",
    diabetic: "Insulin",
    hivStatus: "Not tested"
  },
  chinese: {
    patientId: "9bd049c5-7407-4129-a973-17291ccdd2cc",
    siteId: "ccc4e687-a094-4533-b136-c507fe00a9a8",
    genderAtBirth: "Female",
    countryOfBirth: "CN",
    age: 32,
    bmi: 33.1,
    injectingDrugUse: "No",
    homeless: "Yes",
    imprisoned: "No",
    smoker: "No",
    diabetic: "Not known",
    hivStatus: "Not known"
  }
};
const samples = {
  normal: {
    labId: "d19637ed-e5b4-4ca7-8418-8713646a3359",
    isolateId: "9c0c00f2-8cb1-4254-bf53-3271f35ce696",
    collectionDate: moment.utc([2018, 9, 19]).toDate(),
    prospectiveIsolate: "Yes",
    countryIsolate: "IN",
    cityIsolate: "Mumbai",
    longitudeIsolate: -1.2577263,
    latitudeIsolate: 51.7520209,
    dateArrived: moment.utc([2018, 8, 1]).toDate(),
    anatomicalOrigin: "Respiratory",
    smear: "Not known"
  },
  chinese: {
    labId: "f134b514-d2ac-460c-808b-9c5fd9cb9859",
    isolateId: "820a78d6-b5b9-45c4-95d1-9463e6bdb14a",
    collectionDate: moment.utc([2018, 6, 22]).toDate(),
    prospectiveIsolate: "Yes",
    countryIsolate: "CH",
    cityIsolate: "Chongqing",
    longitudeIsolate: -9.345667,
    latitudeIsolate: 56.565478,
    dateArrived: moment.utc([2017, 10, 5]).toDate(),
    anatomicalOrigin: "Respiratory",
    smear: "Not known"
  },
  nullCountry: {
    labId: "d19637ed-e5b4-4ca7-8418-8713646a3359",
    isolateId: "9c0c00f2-8cb1-4254-bf53-3271f35ce696",
    collectionDate: moment.utc([2018, 9, 19]).toDate(),
    prospectiveIsolate: "Yes",
    countryIsolate: null,
    cityIsolate: null,
    dateArrived: moment.utc([2018, 8, 1]).toDate(),
    anatomicalOrigin: "Respiratory",
    smear: "Not known"
  }
};
const genotypings = {
  normal: {
    wgsPlatform: "MiSeq",
    otherGenotypeInformation: "Yes",
    genexpert: "Not tested",
    hain: "INH/RIF test",
    hainRif: "RIF resistant",
    hainInh: "INH sensitive",
    hainFl: "Not tested",
    hainAm: "Not tested",
    hainEth: "Not tested"
  },
  mdr: {
    wgsPlatform: "HiSeq",
    otherGenotypeInformation: "Yes",
    genexpert: "Not tested",
    hain: "INH/RIF test",
    hainRif: "RIF resistant",
    hainInh: "INH resistant",
    hainFl: "Not tested",
    hainAm: "Not tested",
    hainEth: "Not tested"
  }
};
const phenotypings = {
  normal: {
    phenotypeInformationFirstLineDrugs: "Yes",
    rifampicin: {
      susceptibility: "Resistant",
      method: "Not known"
    },
    ethambutol: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    pyrazinamide: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    isoniazid: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    phenotypeInformationOtherDrugs: "No"
  },
  mdr: {
    phenotypeInformationFirstLineDrugs: "Yes",
    rifampicin: {
      susceptibility: "Resistant",
      method: "Not known"
    },
    ethambutol: {
      susceptibility: "Resistant",
      method: "Not known"
    },
    pyrazinamide: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    isoniazid: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    phenotypeInformationOtherDrugs: "Yes",
    rifabutin: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    ofloxacin: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    ciprofloxacin: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    levofloxacin: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    gatifloxacin: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    amikacin: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    kanamycin: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    gentamicin: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    streptomycin: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    capreomycin: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    clofazimine: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    pas: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    linezolid: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    ethionamideProthionamide: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    rerizidone: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    amoxicilinClavulanate: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    thioacetazone: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    imipenemImipenemcilastatin: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    meropenem: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    clarythromycin: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    highDoseIsoniazid: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    bedaquiline: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    delamanid: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    prothionamide: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    pretothionamide: {
      susceptibility: "Sensitive",
      method: "Not known"
    },
    pretomanid: {
      susceptibility: "Sensitive",
      method: "Not known"
    }
  }
};
const treatments = {};
const outcomes = {};

export default {
  uploadedMetadata: {
    patient: patients.normal,
    sample: samples.normal,
    genotyping: genotypings.normal,
    phenotyping: phenotypings.normal
  },
  uploadedMetadataNullCountry: {
    patient: patients.normal,
    sample: samples.nullCountry,
    genotyping: genotypings.normal,
    phenotyping: phenotypings.normal
  },
  uploadedMetadataChina: {
    patient: patients.chinese,
    sample: samples.chinese,
    genotyping: genotypings.mdr,
    phenotyping: phenotypings.mdr
  }
};
