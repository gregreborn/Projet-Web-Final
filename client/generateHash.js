import bcrypt from 'bcryptjs';

const password = 'adminpass'; // The password you want to hash
const saltRounds = 10;

bcrypt.hash(password, saltRounds)
  .then(hash => {
    console.log('Hash:', hash);
  })
  .catch(err => {
    console.error('Error:', err);
  });
