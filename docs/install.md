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


## Llama Prompt Guard 2 86M

This model is used for initial user input sanitization and is installed under
src/python/llama_prompt_guard_2_86m.

This full install guide is useful:
https://medium.com/@sathishkumar.babu89/running-llama-prompt-guard-2-locally-a-complete-guide-to-rag-security-5bd7923c1169

Install notes:
- Create the env with:
  python -m venv prompt_guard_env

- Use option A (Auto-Cache) for the download, saved to download_model.py
  This downloads the model to ~/.cache/huggingface/hub/

To enable:
1. Add PROMPT_GUARD_ENABLED=true (or false to disable) to the server env.
2. Start the guard:

cd src/python/llama_prompt_guard_2_86m
. prompt_guard_env/bin/activate
python server.py

