# Sử dụng image Node.js chính thức không phải alpine
FROM node:20

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]