const { Client } = require('pg');

async function test(connectionString, label) {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log(`SUCCESS [${label}]: Connected!`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`FAILURE [${label}]: ${err.message}`);
    return false;
  }
}

async function run() {
  const pass = 'chirag@2004';
  const passEncoded = encodeURIComponent(pass);
  
  const variants = [
    { url: `postgresql://Varsha%20Malik:chirag@2004@localhost:5432/postgres`, label: 'User: Varsha Malik, Pass: chirag@2004' },
    { url: `postgresql://postgres:chirag@2004@localhost:5432/postgres`, label: 'User: postgres, Pass: chirag@2004 (Retry)' },
  ];

  for (const v of variants) {
    if (await test(v.url, v.label)) break;
  }
}

run();
