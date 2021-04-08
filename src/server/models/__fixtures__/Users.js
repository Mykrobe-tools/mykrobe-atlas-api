import passwordHash from "password-hash";

export default {
  valid: {
    admin: {
      firstname: "David",
      lastname: "Robin",
      role: "Administrator",
      phone: "06734929442",
      username: "admin@nhs.co.uk",
      email: "admin@nhs.co.uk"
    },
    thomas: {
      firstname: "Thomas",
      lastname: "Carlos",
      role: "Carer",
      phone: "07737929442",
      username: "thomas.carlos@nhs.net",
      email: "thomas.carlos@nhs.net"
    },
    neil: {
      firstname: "Neil",
      lastname: "Robin",
      phone: "023435493253",
      username: "neil@nhs.co.uk"
    },
    helen: {
      firstname: "Chris",
      lastname: "Dee",
      phone: "034634843435",
      username: "chris@nhs.co.uk"
    },
    steven: {
      firstname: "Steven",
      lastname: "Burns",
      phone: "02323545432",
      username: "steven@nhs.co.uk"
    },
    userToVerify: {
      firstname: "Sara",
      lastname: "Crowe",
      phone: "032435940944",
      username: "sara@nhs.co.uk"
    }
  },
  invalid: {
    duplicateEmail: {
      firstname: "Ali",
      lastname: "Walter",
      role: "Carer",
      phone: "083231292248",
      username: "thomas.carlos@nhs.net"
    },
    duplicatePhone: {
      firstname: "Sean",
      lastname: "Moses",
      role: "Carer",
      phone: "07737929442",
      username: "sean@nhs.co.uk"
    },
    missingEmail: {
      firstname: "David",
      lastname: "Robin",
      role: "Administrator",
      phone: "06734929442"
    }
  }
};
