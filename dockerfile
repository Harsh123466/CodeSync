# Bulid the frontend [dist folder]
# copy the dist folder content in backend/public folder


FROM node:20-alpine as frontend-bulider

COPY ./frontend /app

WORKDIR /app

RUN npm install

RUN npm run build


# Build the backend
FROM node:20-alpine

COPY ./backend /app

WORKDIR /app

RUN npm install

COPY --from=frontend-bulider /app/dist app/public

CMD ["node", "server.js"]