const { Client } = require('pg');

async function test() {
  const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Connect to default DB first
    password: '',
    port: 5432,
  };

  console.log('Testing with config:', { ...config, password: '****' });

  const client = new Client(config);

  try {
    await client.connect();
    console.log('SUCCESS: Connected to postgres database!');
    
    // Try to create the target database if it doesn't exist
    try {
      await client.query('CREATE DATABASE "financeAppDB"');
      console.log('SUCCESS: Created financeAppDB database!');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('INFO: financeAppDB already exists.');
      } else {
        console.log('ERROR creating database:', err.message);
      }
    }

    await client.end();
  } catch (err) {
    console.error('FAILURE connecting:', err.message);
  }
}

test();
