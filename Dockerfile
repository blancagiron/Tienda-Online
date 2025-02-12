# Usamos la imagen oficial de Node.js como base
FROM node:16

# Creamos y establecemos el directorio de trabajo dentro del contenedor
WORKDIR /tienda

# Copiamos el package.json y package-lock.json (o yarn.lock) para instalar las dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install --production

# Copiamos el resto del código de la aplicación al contenedor
COPY . .

RUN rm -rf react

# Exponemos el puerto 8000
EXPOSE 8000

# Establecemos las variables de entorno necesarias
ENV IN=production
ENV USER_DB=root
ENV PASS=example
ENV SECRET_KEY="dai"
ENV DB_HOST=mongo

# Comando para ejecutar la aplicación cuando inicie el contenedor
CMD ["node", "tienda.js"]