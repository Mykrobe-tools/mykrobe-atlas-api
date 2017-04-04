import passwordHash from 'password-hash';

export default {
  admin: {
    firstname: 'David',
    lastname: 'Robin',
    role: 'Admin',
    password: passwordHash.generate('password'),
    valid: true,
    verificationToken: 107165,
    phone: '06734929442',
    email: 'admin@nhs.co.uk'
  },
  thomas: {
    firstname: 'Thomas',
    lastname: 'Carlos',
    role: 'Carer',
    valid: true,
    verificationToken: 107166,
    resetPasswordToken: '54VwcGr65AKaules/blueln7w1o',
    password: passwordHash.generate('password'),
    phone: '07737929442',
    email: 'thomas@nhs.co.uk'
  },
  neil: {
    firstname: 'Neil',
    lastname: 'Robin',
    valid: true,
    verificationToken: 955311,
    password: passwordHash.generate('password'),
    phone: '023435493253',
    email: 'neil@nhs.co.uk'
  },
  helen: {
    firstname: 'Chris',
    lastname: 'Dee',
    valid: true,
    password: passwordHash.generate('password'),
    phone: '034634843435',
    email: 'chris@nhs.co.uk'
  },
  steven: {
    firstname: 'Steven',
    lastname: 'Burns',
    valid: true,
    password: passwordHash.generate('password'),
    phone: '02323545432',
    email: 'steven@nhs.co.uk'
  },
  userWithToken: {
    firstname: 'Adam',
    lastname: 'Radu',
    valid: true,
    password: passwordHash.generate('password'),
    resetPasswordToken: '54VwcGr65AKaizXTVqLhEo6cnkln7w1o',
    phone: '093249926483',
    email: 'adam@nhs.co.uk'
  },
  userToVerify: {
    firstname: 'Sara',
    lastname: 'Crowe',
    password: passwordHash.generate('password'),
    verificationToken: 'i9KOcGrwsAKaizXTVqLhE96cnkln72QA',
    phone: '032435940944',
    email: 'sara@nhs.co.uk'
  }
};
