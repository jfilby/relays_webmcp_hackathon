# Install

## Node.js

Install Node.js v22 LTS.


## Postgres

Create a database named relays.

Extensions to install for the relays database:
- vector (PgVector)
- pg_trgm (Trigram search)

Create the Prisma schema:
pnpm prisma db push

Run the search setup SQL script:
server/prisma/custom-migrations/search-setup.sql


## Demo data

The Relays project will be assigned to the builder's user profile, make sure
it exists with publicId 'jason-filby' before running the demo-data command.

