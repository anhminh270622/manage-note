# --- Stage 1: Build app ---
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY *.tgz ./

# Cài dependencies
RUN npm install

COPY . .
RUN npm run build

# --- Stage 2: Serve with nginx ---
FROM nginx:alpine

# Xóa default config và copy nginx.conf của mình
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

# Copy build output từ stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
