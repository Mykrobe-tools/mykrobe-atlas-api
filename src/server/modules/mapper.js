import objectMapper from "object-mapper";

const matadataMap = {
  "0": "file",
  "1": "metadata.sample.cityIsolate",
  "2": "metadata.sample.countryIsolate",
  "4": "metadata.sample.isolateId",
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
      transform: value => value
    }
  ];
  return objectMapper(src, susceptibilityMap);
};

const phylogeneticsMap = {
  "3": [
    {
      key: "name",
      transform: value => "lineage"
    },
    {
      key: "result",
      transform: value => value
    }
  ]
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

const transform = src => {
  const metadata = objectMapper(src, matadataMap);
  const susceptibility = [];
  const phylogenetics = [];
  phylogenetics.push(objectMapper(src, phylogeneticsMap));
  susceptibility.push(mapSusceptibility(src, "9", "Isoniazid"));
  susceptibility.push(mapSusceptibility(src, "10", "Rifampicin"));
  susceptibility.push(mapSusceptibility(src, "11", "Ethambutol"));
  susceptibility.push(mapSusceptibility(src, "12", "Pyrazinamide"));
  const results = [
    {
      type: "predictor",
      analysed: new Date(),
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
