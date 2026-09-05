#!/bin/sh
set -e

echo "==> Esperando a que la base de datos esté lista y sincronizando esquema de Prisma..."
npx prisma db push --accept-data-loss

echo "==> Verificando si es necesario ejecutar la semilla de datos iniciales..."
node prisma/seed.js || echo "Semilla inicial ya cargada o fallo no crítico."

echo "==> Iniciando servidor de producción Next.js..."
exec node server.js
