import { experiment as experimentJsonSchema } from "mykrobe-atlas-jsonschema";
import SchemaExplorer from "makeandship-api-common/lib/modules/jsonschema/schema-explorer";

import { geocode } from "../modules/geo/";

// constants
const explorer = new SchemaExplorer(experimentJsonSchema);

const countryEnum = explorer.getAttributeBy("metadata.sample.countryIsolate", "enum");
const countryEnumNames = explorer.getAttributeBy("metadata.sample.countryIsolate", "enumNames");

// countries mapping
const countriesMapping = {
  USA: {
    country: "United States"
  },
  "Cote d'Ivoire": {
    country: "Ivory Coast (Cote D'Ivoire)"
  },
  "Viet Nam": {
    country: "Vietnam"
  },
  Azerbaijan: {
    country: "Azerbaidjan"
  },
  Moldova: {
    country: "Moldavia"
  },
  Russia: {
    country: "Russian Federation"
  },
  Tajikistan: {
    country: "Tadjikistan"
  },
  Korea: {
    country: "South Korea"
  },
  "Canada;Ontario": {
    country: "Canada",
    city: "Ontario"
  },
  "Democratic Republic of the Congo": {
    country: "Congo"
  },
  "Canada;Toronto": {
    country: "Canada",
    city: "Toronto"
  },
  "Beijing, China": {
    country: "China",
    city: "Beijing"
  },
  PERU: {
    country: "Peru"
  },
  UK: {
    country: "United Kingdom"
  },
  "Côte d'Ivoire": {
    country: "Ivory Coast (Cote D'Ivoire)"
  },
  "USA, San Francisco": {
    country: "United States",
    city: "San Francisco"
  },
  "New Guinea": {
    country: "Papua New Guinea"
  },
  Valencia: {
    country: "Spain",
    city: "Valencia"
  },
  Lanzarote: {
    country: "Spain",
    city: "Lanzarote"
  },
  "Gran Canaria": {
    country: "Spain",
    city: "Gran Canaria"
  },
  Tenerife: {
    country: "Spain",
    city: "Tenerife"
  },
  Fuerteventura: {
    country: "Spain",
    city: "Fuerteventura"
  },
  Zaragoza: {
    country: "Spain",
    city: "Zaragoza"
  }
};

const citiesMapping = {
  "Osaka, Osaka": "Osaka",
  "Hyogo, Kobe": "Hyogo",
  Midlands: "Birmingham",
  "Boston, MA": "Boston",
  "Worchester, MA": "Worcester",
  "MA, Worchester": "Worcester",
  "King George V Hospital, Durban": "Durban",
  "FOSA Hospital": "Pietermaritzburg",
  "Northdale Hospital - Ward C": "Pietermaritzburg",
  "Prince Msheyeni": "Umlazi",
  "Charles Johnson Memorial": "Nqutu",
  "Saint Margaret": "Cape Town",
  "Point G Hospital": "Bamako",
  Escourt: "Pretoria",
  Ngwelezane: "uMhlathuze Local Municipality",
  "Limpopo - Polokwane Hospital": "Polokwane",
  "Free State - JS Moroka Hospital": "Free State",
  "Eastern Cape - Alicedale Clinic": "Alicedale",
  "Northen Cape - Progress Clinic": "Upington",
  "Northen Cape - Keimoes Municipal Clinic": "Keimoes",
  "Prince Cyril Zulu CDC": "Durban", // ZA
  "Doris Goodwin Hospital - Parkhome Clinic": "Pietermaritzburg", // ZA
  "Inanda CHC": "Inanda",
  "Catherine Booth Hospital MDRTB Ward": "Amatikulu", // ZA
  "KDH MDR TB Clinic": "Nairobi", // KE - review
  "Thulasizwe Hopsital": "KwaZulu-Natal", // ZA
  "IALCH - A3E Endo/Resp/GI/Metab Ward": "Durban", // ZA
  "Umlazi U21 Clinic": "Umlazi", // ZA
  "Mahatma Gandhi Hospital - Ward 1": "Sitapura", // IN - review
  "Mahatma Gandhi Hospital - Ward 5": "Sitapura", // IN - review
  "Mahatma Gandhi": "Sitapura", // IN - review
  "Mahatma Gandhi Hospital - Casualty": "Sitapura", //IN - review,
  Ceza: "KwaZulu-Natal", // ZA
  "KDH MS1 Male TB Medical": "", // KE
  "Manguzi Hospital - MDR TB Clinic": "Manguzi", // ZA
  "Mosvold Hospital - isolation ward": "Ingwavuma", // ZA
  "Thalusizwe Hospital Outreach Clinic": "KwaZulu-Natal", // ZA
  "Manguzi Hospital - MDR TB Clinic": "Manguzi", // ZA
  "Murchison Hospital - MDR TB OPD": "", //ZA
  "Baltimore, MD": "Baltimore",
  MA: "Boston",
  "Baltimore, Maryland": "Baltimore",
  "Buenaventura, Valle del Cauca": "Buenaventura",
  "Durban Chest Clinic": "Durban",
  "King Dinuzulu Hospital": "Durban",
  Tiruvallur: "Thiruvallur",
  "east of BEIJING": "Beijing",
  "Mosvold Hospital - isolation ward": "Ingwavuma",
  "Murchison Hospital - MDR TB OPD": "Port Shepstone",
  "Umphumulo hospital": "KwaDukuza",
  "Ntuze clinic": "Empangeni",
  Ceza: "KwaZulu-Natal",
  "Mosvold Hospital": "Ingwavuma",
  "Murchison Hopsital": "Port Shepstone",
  "Manguzi Hospital": "Manguzi",
  "Untunjambili Hospital": "Kranskop",
  "Sundumbili Clinic": "Mandini",
  "Kwa-Mashu Poly Clinic": "KwaMashu",
  "Thokozani Clinic": "Empangeni",
  "Amakhabela Clinic": "Vukaphansi",
  "King Edward VIII Hospital": "Durban",
  "Edendale Hospital": "Pietermaritzburg",
  "Mpu, Muza Clinic": "The Msunduzi Rural",
  "Ngwelezana Hospital": "Empangeni",
  "Shallcross Clinic": "Durban",
  "Prince Mshiyeni Memorial Hospital": "Umlazi",
  "Doris Goodwin Hospital": "Pietermaritzburg",
  "Sihleza Clinic": "Ingwe Rural",
  "Kwazulu-Natal": "Durban",
  "Damien Foundation Project area": "", // BA,
  "Chiribaya Alta": "Chiribaya", // PE,
  Massachusetts: "Boston",
  Bucuresti: "Bucharest",
  "San Francisco, CA": "San Francisco",
  "Torres Strait Protected Zone": "", // AU
  MD: "Annapolis", // US
  VA: "Richmond",
  Supanburi: "Suphan Buri", // TH
  Andaman: "", // IN
  "The Sakha (Yakutia) Republic": "Yakutsk",
  "Gran Canaria": "Las Palmas de Gran Canaria",
  Tenerife: "Santa Cruz de Tenerife",
  Lanzarote: "Arrecife"
};

class LocationHelper {
  static parseLocation(country) {
    const location = {
      countryIsolate: "",
      cityIsolate: ""
    };

    if (country) {
      if (country.includes(":")) {
        const parts = country.split(":");
        location.countryIsolate = parts[0].trim();
        location.cityIsolate = parts[1].trim();
      } else if (country.includes(",")) {
        const parts = country.split(",");
        location.countryIsolate = parts[1].trim();
        location.cityIsolate = parts[0].trim();
      } else if (country.toLowerCase() === "unknown") {
        // no change
      } else {
        location.countryIsolate = country.trim();
      }
    }
    // re-map
    if (location.countryIsolate || location.cityIsolate) {
      // countries which may map to country or country + city
      if (countriesMapping[location.countryIsolate]) {
        location.cityIsolate =
          countriesMapping[location.countryIsolate].city || location.cityIsolate;
        location.countryIsolate = countriesMapping[location.countryIsolate].country;
      }

      // remap cities which also have issues
      if (typeof citiesMapping[location.cityIsolate] !== "undefined") {
        location.cityIsolate = citiesMapping[location.cityIsolate];
      }
    }

    if (location.countryIsolate) {
      location.countryIsolateName = location.countryIsolate;

      const countryCode = this.getCountryCode(location.countryIsolate);
      location.countryIsolate = countryCode ? countryCode : null;
    }

    return location;
  }

  /**
   * Get country from code
   * @param {*} code
   * @return String country
   */
  static getCountry(code) {
    if (code) {
      const index = countryEnum.indexOf(code);
      if (index > -1) {
        return countryEnumNames[index];
      }
    }
    return null;
  }

  /**
   * Get coordinates
   * @param {*} object - city, countryCode
   */
  static async getCoordinates(location) {
    if (location) {
      const coordinates = await geocode(location);
      return coordinates;
    }
    return null;
  }

  /**
   *
   * @param {*} experiments
   * @param {*} citiesAndCountries
   */
  static getCountryCode(country) {
    if (country) {
      const index = countryEnumNames.indexOf(country);
      if (index > -1) {
        return countryEnum[index];
      }
    }

    return null;
  }
}

export default LocationHelper;
