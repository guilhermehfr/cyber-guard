#!/bin/sh
set -e

cd /app/api
export PATH="$PWD/node_modules/.bin:$PATH"

echo "Applying database migrations..."
prisma migrate deploy

echo "Seeding the database..."
prisma db seed

exec "$@"