FROM marcosstefani/sucuri:latest

COPY . .

CMD ["sucuri", "serve", "main.py", "--host", "0.0.0.0"]
