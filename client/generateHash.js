import bcrypt from 'bcryptjs';

const [,, password] = process.argv;
const saltRounds = 10;

if (!password) {
  console.log('Usage: node generateHash.js <password>');
  process.exit(1);
}

bcrypt.hash(password, saltRounds)
  .then(hash => {
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}\n`);
  })
  .catch(err => {
    console.error('Error:', err);
  });
