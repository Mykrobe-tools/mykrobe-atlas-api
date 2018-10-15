import objectMapper from "object-mapper";

const phylogenetics = {
  Delhi: {
    complex: "Mycobacterium_tuberculosis_complex",
    "sub-complex": "subMycobacterium_tuberculosis_complex",
    species: "Mycobacterium_tuberculosis",
    "sub-species": "Delhi_Central_Asia"
  },
  Beijing: {
    complex: "Mycobacterium_tuberculosis_complex",
    "sub-complex": "subMycobacterium_tuberculosis_complex",
    species: "Mycobacterium_tuberculosis",
    "sub-species": "Beijing_East_Asia"
  },
  EAI: {
    complex: "Mycobacterium_tuberculosis_complex",
    "sub-complex": "subMycobacterium_tuberculosis_complex",
    species: "Mycobacterium_tuberculosis",
    "sub-species": "East_Africa_Indian_ocean"
  },
  "West African 2": {
    complex: "Mycobacterium_tuberculosis_complex",
    "sub-complex": "subMycobacterium_tuberculosis_complex",
    species: "Mycobacterium_africanum",
    "sub-species": "West_Africa"
  },
  "M. bovis": {
    complex: "Mycobacterium_tuberculosis_complex",
    "sub-complex": "subMycobacterium_tuberculosis_complex",
    species: "Mycobacterium_bovis"
  },
  Cameroon: {
    complex: "Mycobacterium_tuberculosis_complex",
    "sub-complex": "subMycobacterium_tuberculosis_complex",
    species: "Mycobacterium_africanum"
  },
  "West African 1b": {
    complex: "Mycobacterium_tuberculosis_complex",
    "sub-complex": "subMycobacterium_tuberculosis_complex",
    species: "Mycobacterium_africanum",
    "sub-species": "West_Africa"
  },
  BCG: {
    complex: "Mycobacterium_tuberculosis_complex",
    "sub-complex": "subMycobacterium_tuberculosis_complex",
    species: "Mycobacterium_bovis",
    "sub-species": "Mycobacterium_bovis_subsp_bcg"
  },
  "M. caprae": {
    complex: "Mycobacterium_tuberculosis_complex",
    "sub-complex": "subMycobacterium_tuberculosis_complex",
    species: "Mycobacterium_microti"
  },
  "M. microti": {
    complex: "Mycobacterium_tuberculosis_complex",
    "sub-complex": "subMycobacterium_tuberculosis_complex",
    species: "Mycobacterium_caprae"
  }
};

const matadataMap = {
  "0": "file",
  "1": "metadata.sample.cityIsolate",
  "2": "metadata.sample.countryIsolate",
  //"4": "metadata.sample.isolateId",
  "5": {
    key: "metadata.phenotyping.isoniazid.susceptibility",
    transform: value => transformSusceptibility(value)
  },
  "6": {
    key: "metadata.phenotyping.rifampicin.susceptibility",
    transform: value => transformSusceptibility(value)
  },
  "7": {
    key: "metadata.phenotyping.ethambutol.susceptibility",
    transform: value => transformSusceptibility(value)
  },
  "8": {
    key: "metadata.phenotyping.pyrazinamide.susceptibility",
    transform: value => transformSusceptibility(value)
  }
};

const mapSusceptibility = (src, key, drugName) => {
  const susceptibilityMap = {};
  susceptibilityMap[key] = [
    {
      key: "name",
      transform: value => drugName
    },
    {
      key: "prediction",
      transform: value => transformPrediction(value)
    }
  ];
  return objectMapper(src, susceptibilityMap);
};

const mapPhylogenetics = key => {
  const phylogeneticsMap = phylogenetics[key];
  if (phylogeneticsMap) {
    const result = [];
    Object.keys(phylogeneticsMap).forEach(phylogeneticsKey => {
      result.push({
        type: phylogeneticsKey,
        result: phylogeneticsMap[phylogeneticsKey]
      });
    });
    return result;
  }
};

const transformSusceptibility = value => {
  if (value === "S") {
    return "Sensitive";
  } else if (value === "R") {
    return "Resistant";
  } else if (value === "U") {
    return "Inconclusive";
  } else {
    return "Not tested";
  }
};

const transformPrediction = value => {
  if (["R", "S"].includes(value)) {
    return value;
  }
};

const transform = src => {
  const metadata = objectMapper(src, matadataMap);
  const susceptibility = [];
  const phylogenetics = mapPhylogenetics(src[3]);
  susceptibility.push(mapSusceptibility(src, "9", "Isoniazid"));
  susceptibility.push(mapSusceptibility(src, "10", "Rifampicin"));
  susceptibility.push(mapSusceptibility(src, "11", "Ethambutol"));
  susceptibility.push(mapSusceptibility(src, "12", "Pyrazinamide"));
  const results = [
    {
      type: "predictor",
      analysed: new Date().toISOString(),
      susceptibility,
      phylogenetics
    }
  ];
  return Object.assign(metadata, { results });
};

const mapper = Object.freeze({
  transform
});

export default mapper;
