FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build de Next.js (producción)
RUN npm run build

EXPOSE 3000

# Arranque en modo producción
CMD ["npm", "start"]
