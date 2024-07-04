## Initial Setup

1. setup env folder based on .env.example (copy into .env and update as needed)
2. `docker-compose up -d`
3. `npm install` / `npm ci` (only need to once for below)
4. `npm run migrate`
5. `npm run start` or `npm run dev`

## Additional Options

- comment out the pgAdmin & pgadmin-data volume to debug db to connect use user/pass/port in docker compose and for IP use `host.docker.internal`
  - example of above:
  - ![PGAdmin login connect server example image](images/pgAdmin_example.png)
- use `npm run dev` for running locally, eventually will setup compose to run frontend too which then start will be for
- every-time you change the DB or add to schema.prisma you have to run `npm run migrate` to rebuild tables etc. npm run dev & start already run generate for client so that should not have to be run
