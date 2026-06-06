const bcrypt = require('bcrypt');

const password = '123456';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
        process.exit(1);
    }
    console.log('Password:', password);
    console.log('Bcrypt Hash:', hash);
    console.log('\nUse this hash in your seed.sql for the password field.');
});
