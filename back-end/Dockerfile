FROM node:24

WORKDIR /app

# Копируем только манифесты для кэширования npm install
COPY package*.json ./

RUN npm install --production

# КОПИРУЕМ ВСЕ ОСТАЛЬНЫЕ ФАЙЛЫ ИЗ ТЕКУЩЕЙ ПАПКИ (bek-end)
# Не указывай имя папки! Мы уже внутри неё.
COPY . .

EXPOSE 3000

# Убедись, что index.js существует по этому пути
CMD ["node", "src/app.js"]