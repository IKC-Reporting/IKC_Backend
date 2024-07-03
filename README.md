## Initial Setup

1. comment out all but ikc_reporting_db (should already be done)
2. "docker-compose up -d"
3. "npm install" / "npm ci" (only need to once for below)
4. "npm run migrate"
5. "npm run start" to run backend (docker not current working but for dev on backend need to run locally anyways)

## Additional Options

- comment out the pgAdmin & pgadmin-data volume to debug db to connect use user/pass/port in docker compose and for IP use `host.docker.internal`
- use `npm run dev` for running locally, eventually will setup compose to run frontend too which then start will be for
- every-time you change the DB or add to schema.prisma you have to run `npm run migrate` to rebuild tables etc. npm run dev & start already run generate for client so that should not have to be run
