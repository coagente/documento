FROM node:18-alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Limpiar cache si existe
RUN rm -rf .next

# Exponer puerto 3001
EXPOSE 3001

# Variable de entorno por defecto
ENV NODE_ENV=development
ENV PORT=3001

# Comando de inicio
CMD ["npm", "run", "dev", "--", "--port", "3001", "--hostname", "0.0.0.0"] 