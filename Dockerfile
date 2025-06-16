FROM node:lts as build-stage

WORKDIR /gockelmaps

COPY package*.json ./
RUN npm ci

COPY ./ ./

RUN npm run build

FROM nginx:alpine as production-stage

#RUN rm -rf ./*

COPY --from=build-stage /gockelmaps/www /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]