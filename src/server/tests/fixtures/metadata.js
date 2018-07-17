const patients = {
  normal: {
    patientId: "eff2fa6a-9d79-41ab-a307-b620cedf7293",
    siteId: "a2a910e3-25ef-475c-bdf9-f6fe215d949f",
    genderAtBirth: "Male",
    countryOfBirth: "India",
    patientAge: 43,
    bmi: 25.3,
    injectingDrugUse: "No",
    homeless: "No",
    imprisoned: "No",
    smoker: "Yes",
    diabetic: "Insulin",
    hivStatus: "Not tested"
  }
};
const samples = {
  normal: {
    labId: "d19637ed-e5b4-4ca7-8418-8713646a3359",
    isolateId: "9c0c00f2-8cb1-4254-bf53-3271f35ce696",
    collectionDate: "2018-10-19",
    prospectiveIsolate: "Yes",
    countryIsolate: "India",
    cityIsolate: "Mumbai",
    dateArrived: "2018-09-01",
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
  }
};
