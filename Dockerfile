FROM node:20-alpine AS css-build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-fund --no-audit
COPY tailwind.config.js ./
COPY templates ./templates
RUN npm run build:css

FROM marcosstefani/sucuri:1.0.27

COPY . .
COPY --from=css-build /app/templates/static/style/tailwind.css templates/static/style/tailwind.css

CMD ["sucuri", "serve", "main.py", "--host", "0.0.0.0"]
