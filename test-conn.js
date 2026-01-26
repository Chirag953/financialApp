const { Client } = require('pg');

async function test() {
  const passwords = ['chirag@2004', 'Chirag@2004', 'chirag', '2004', 'postgres', 'admin'];
  const users = ['postgres', 'chirag', 'Varsha Malik'];

  for (const user of users) {
    for (const password of passwords) {
      const client = new Client({
        user: user,
        host: 'localhost',
        database: 'postgres',
        password: password,
        port: 5432,
      });

      try {
        await client.connect();
        console.log(`SUCCESS: user=${user}, password=${password}`);
        await client.end();
        process.exit(0);
      } catch (err) {
        console.log(`FAILED: user=${user}, password=${password} - ${err.message}`);
      }
    }
  }
}

test();
