# Stage 1: Build the Angular application
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production --base-href / --source-map

# Debug step (optional): List the contents of the build output directory
RUN ls -la /app/dist/client

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the browser folder (which contains the actual client build)
COPY --from=build /app/dist/client/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
