export default {
  apiKey: process.env.MANDRILL_API_KEY,
  from: process.env.MANDRILL_FROM_EMAIL,
  fromName: process.env.MANDRILL_FROM_NAME,
  invitationTemplate: "atlas-invitation",
  registrationTemplate: "atlas-registration",
  inviteLink: process.env.MANDRILL_INVITE_LINK,
  registerLink: process.env.MANDRILL_REGISTER_LINK,
  invitationSubject: "Invitation to Mykrobe Organisation",
  registrationSubject: "Invitation to join Mykrobe Atlas"
};
