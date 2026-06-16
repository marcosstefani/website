FROM marcosstefani/sucuri:1.0.27

COPY . .

CMD ["sucuri", "serve", "main.py", "--host", "0.0.0.0"]
