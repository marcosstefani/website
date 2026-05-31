FROM marcosstefani/sucuri:1.0.25

COPY . .

CMD ["sucuri", "serve", "main.py", "--host", "0.0.0.0"]
