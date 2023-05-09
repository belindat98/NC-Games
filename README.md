# Northcoders House of Games API

## Set up environment variables
In order to successfully connect to the correct database, you will need to create two files;

- `.env.development` which will connect to your development database. In this file you will need the following code, replacing with the name of your development database. 
    > `PGDATABASE= <YOUR_DEVELOPMENT_DATABASE_NAME>`
- `.env.test` which will connect to your test database. In this file put the below code, replacing with the name of your test database.
    > `PGDATABASE= <YOUR_TEST_DATABASE_NAME>`

Ensure both the new files you have created are included in the `.gitignore`.