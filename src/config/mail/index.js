export default {
  providers: {
    mandrill: {
      apiKey: process.env.MANDRILL_API_KEY
    }
  },
  from: process.env.MANDRILL_FROM_EMAIL,
  fromName: process.env.MANDRILL_FROM_NAME,
  inviteLink: process.env.MANDRILL_INVITE_LINK,
  registerLink: process.env.MANDRILL_REGISTER_LINK,
  invitationSubject: "Invitation to Mykrobe Organisation",
  registrationSubject: "Invitation to join Mykrobe Atlas",
  joinRequestSubject: "A new member joined your organisation",
  joinRequestApprovedSubject: "Your join request has been approved",
  invitationTemplate: "atlas-invitation",
  registrationTemplate: "atlas-registration",
  joinRequestTemplate: "atlas-join-request",
  joinRequestApprovedTemplate: "atlas-join-request-approved",
  provider: "Mandrill"
};
