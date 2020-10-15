export default {
  salta: {
    name: "Salta Group",
    annotation: "Lorem ipsum",
    searchQuery: {
      type: "sequence",
      bigsi: {
        query: {
          seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
          threshold: 0.9
        }
      }
    }
  },
  tandil: {
    name: "Tandil Group",
    annotation: "dolor sit amet",
    searchQuery: {
      type: "dna-variant",
      bigsi: {
        query: {
          ref: "S",
          alt: "L",
          pos: 450,
          gene: "rpoB"
        }
      }
    }
  },
  medoza: {
    name: "Mendoza Group",
    annotation: "Lorem ipsum",
    searchQuery: {
      type: "sequence",
      bigsi: {
        query: {
          seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
          threshold: 0.7
        }
      }
    }
  }
};
