FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

EXPOSE 5000

# Push Prisma schema to database, seed initial data if needed, and start server
CMD ["sh", "-c", "npx prisma db push && (npx tsx prisma/seed.ts || true) && npx tsx src/index.ts"]
