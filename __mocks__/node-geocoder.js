var GoogleGeocoder = function() {};
GoogleGeocoder.prototype.geocode = function(location) {
  switch (location) {
    case "Birmingham, UK":
      return [
        {
          formattedAddress: "Birmingham, UK",
          latitude: 52.48624299999999,
          longitude: -1.890401,
          extra: {
            googlePlaceId: "ChIJc3FBGy2UcEgRmHnurvD-gco",
            confidence: 0.5,
            premise: null,
            subpremise: null,
            neighborhood: "Birmingham",
            establishment: null
          },
          administrativeLevels: {
            level2long: "West Midlands",
            level2short: "West Midlands",
            level1long: "England",
            level1short: "England"
          },
          city: "Birmingham",
          country: "United Kingdom",
          countryCode: "GB",
          provider: "google"
        }
      ];
    case "Puebla, MX":
      return [
        {
          formattedAddress: "Puebla, Mexico",
          latitude: 19.0414398,
          longitude: -98.2062727,
          extra: {
            googlePlaceId: "ChIJO3q8Xr3Az4URla2U5B1Gpkg",
            confidence: 0.5,
            premise: null,
            subpremise: null,
            neighborhood: "Puebla",
            establishment: null
          },
          administrativeLevels: { level1long: "Puebla", level1short: "Pue." },
          city: "Puebla",
          country: "Mexico",
          countryCode: "MX",
          provider: "google"
        }
      ];
    case "Chennai, IN":
      return [
        {
          formattedAddress: "Chennai, Tamil Nadu, India",
          latitude: 13.0826802,
          longitude: 80.2707184,
          extra: {
            googlePlaceId: "ChIJYTN9T-plUjoRM9RjaAunYW4",
            confidence: 0.5,
            premise: null,
            subpremise: null,
            neighborhood: "Chennai",
            establishment: null
          },
          administrativeLevels: {
            level2long: "Chennai",
            level2short: "Chennai",
            level1long: "Tamil Nadu",
            level1short: "TN"
          },
          city: "Chennai",
          country: "India",
          countryCode: "IN",
          provider: "google"
        }
      ];
    case "Mumbai, IN":
      return [
        {
          formattedAddress: "Mumbai, Maharashtra, India",
          latitude: 19.0759837,
          longitude: 72.8776559,
          extra: {
            googlePlaceId: "ChIJwe1EZjDG5zsRaYxkjY_tpF0",
            confidence: 0.5,
            premise: null,
            subpremise: null,
            neighborhood: "Mumbai",
            establishment: null
          },
          administrativeLevels: {
            level2long: "Mumbai",
            level2short: "Mumbai",
            level1long: "Maharashtra",
            level1short: "MH"
          },
          city: "Mumbai",
          country: "India",
          countryCode: "IN",
          provider: "google"
        }
      ];
    case "Chongqing, China":
      return [
        {
          formattedAddress: "Chongqing, China",
          latitude: 29.4315861,
          longitude: 106.912251,
          extra: {
            googlePlaceId: "ChIJQ0_m87o0kzYRIbOI3BaGn94",
            confidence: 0.5,
            premise: null,
            subpremise: null,
            neighborhood: "Chongqing",
            establishment: null
          },
          administrativeLevels: { level1long: "Chongqing", level1short: "Chongqing" },
          city: "Chongqing",
          country: "China",
          countryCode: "CN",
          provider: "google"
        }
      ];
  }
};

var LocationIQGeocoder = function() {};
LocationIQGeocoder.prototype.geocode = function(location) {
  if (location) {
    if (location.city === "Birmingham" && location.country === "UK") {
      return [
        {
          latitude: 52.4796992,
          longitude: -1.9026911,
          country: "United Kingdom",
          city: "Birmingham",
          state: "England",
          zipcode: undefined,
          streetName: undefined,
          streetNumber: undefined,
          countryCode: "GB",
          provider: "locationiq"
        }
      ];
    } else if (location.city === "Puebla" && location.country === "MX") {
      return [
        {
          latitude: 19.0437227,
          longitude: -98.1984744,
          country: "Mexico",
          city: "Puebla",
          state: "Puebla",
          zipcode: "72000",
          countryCode: "MX",
          provider: "locationiq"
        },
        {
          latitude: 16.91442015,
          longitude: -92.5031066154229,
          country: "Mexico",
          city: "Puebla",
          state: "Chiapas",
          countryCode: "MX",
          provider: "locationiq"
        },
        {
          latitude: 17.582778,
          longitude: -95.683611,
          country: "Mexico",
          city: "Puebla",
          state: "Veracruz",
          countryCode: "MX",
          provider: "locationiq"
        },
        {
          latitude: 20.274722,
          longitude: -98.665,
          country: "Mexico",
          city: "Atotonilco el Grande",
          state: "Hidalgo",
          countryCode: "MX",
          provider: "locationiq"
        },
        {
          latitude: 19.409276,
          longitude: -99.0822258,
          country: "Mexico",
          state: "Mexico City",
          zipcode: "15020",
          countryCode: "MX",
          provider: "locationiq"
        }
      ];
    } else if (location.city === "Chongqing" && location.country === "China") {
      return [
        {
          latitude: 29.5585712,
          longitude: 106.5492822,
          country: "China",
          city: "Chongqing",
          state: "Chongqing",
          zipcode: "400014",
          countryCode: "CN",
          provider: "locationiq"
        },
        {
          latitude: 30.05518,
          longitude: 107.8748712,
          country: "China",
          state: "Chongqing",
          countryCode: "CN",
          provider: "locationiq"
        },
        {
          latitude: 43.8878089,
          longitude: 125.3107786,
          country: "China",
          city: "Changchun City",
          state: "Jilin",
          zipcode: "130000",
          countryCode: "CN",
          provider: "locationiq"
        },
        {
          latitude: 49.25933695,
          longitude: -123.069482419716,
          country: "Canada",
          city: "Vancouver",
          state: "British Columbia",
          zipcode: "V5N 2B7",
          streetName: "Commercial Drive",
          streetNumber: "2808",
          countryCode: "CA",
          provider: "locationiq"
        },
        {
          latitude: 29.5515144,
          longitude: 106.5415811,
          country: "China",
          city: "Chongqing",
          state: "Chongqing",
          zipcode: "400014",
          streetName: "渝铁村",
          countryCode: "CN",
          provider: "locationiq"
        },
        {
          latitude: 49.226799,
          longitude: -122.9937567,
          country: "Canada",
          city: "Burnaby",
          state: "British Columbia",
          zipcode: "V5H 4T2",
          streetName: "Kingsway",
          streetNumber: "4909",
          countryCode: "CA",
          provider: "locationiq"
        },
        {
          latitude: 49.1524881,
          longitude: -122.8900312,
          country: "Canada",
          city: "Surrey",
          state: "British Columbia",
          zipcode: "V4C 0A1",
          streetName: "Scott Road",
          streetNumber: "8220",
          countryCode: "CA",
          provider: "locationiq"
        },
        {
          latitude: 43.605417,
          longitude: 1.4539787,
          country: "France",
          city: "Toulouse",
          state: "Occitania",
          zipcode: "31000",
          streetName: "Rue Pierre Paul Riquet",
          streetNumber: "69",
          countryCode: "FR",
          provider: "locationiq"
        }
      ];
    } else if (location.city === "Chennai" && location.country === "IN") {
      return [
        {
          latitude: 13.0801721,
          longitude: 80.2838331,
          country: "India",
          city: "Chennai",
          state: "Tamil Nadu",
          countryCode: "IN",
          provider: "locationiq"
        }
      ];
    } else if (location.city === "Mumbai" && location.country === "IN") {
      return [
        {
          latitude: 18.9387711,
          longitude: 72.8353355,
          country: "India",
          city: "Mumbai",
          state: "Maharashtra",
          countryCode: "IN",
          provider: "locationiq"
        }
      ];
    }
  }
};

export default function(options) {
  if (options.provider === "google") {
    return new GoogleGeocoder();
  } else if (options.provider === "locationiq") {
    return new LocationIQGeocoder();
  }
}
