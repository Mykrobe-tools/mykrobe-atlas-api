import passwordHash from "password-hash";

export default {
  admin: {
    firstname: "David",
    lastname: "Robin",
    role: "Administrator",
    phone: "06734929442",
    email: "admin@nhs.co.uk"
  },
  thomas: {
    firstname: "Thomas",
    lastname: "Carlos",
    role: "Carer",
    phone: "07737929442",
    email: "thomas@nhs.co.uk"
  },
  neil: {
    firstname: "Neil",
    lastname: "Robin",
    phone: "023435493253",
    email: "neil@nhs.co.uk"
  },
  helen: {
    firstname: "Chris",
    lastname: "Dee",
    phone: "034634843435",
    email: "chris@nhs.co.uk"
  },
  steven: {
    firstname: "Steven",
    lastname: "Burns",
    phone: "02323545432",
    email: "steven@nhs.co.uk"
  },
  userToVerify: {
    firstname: "Sara",
    lastname: "Crowe",
    phone: "032435940944",
    email: "sara@nhs.co.uk"
  },
  invalid: {
    duplicateEmail: {
      firstname: "Ali",
      lastname: "Walter",
      role: "Carer",
      phone: "083231292248",
      email: "thomas@nhs.co.uk"
    },
    duplicatePhone: {
      firstname: "Sean",
      lastname: "Moses",
      role: "Carer",
      phone: "07737929442",
      email: "sean@nhs.co.uk"
    }
  }
};
