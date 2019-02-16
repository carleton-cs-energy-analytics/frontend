# frontend

## Running for development

1) Run `pipenv install`

2) To run the server with your own backend, run 
   `BACKEND_URL="http://localhost:5000/api/" pipenv run python3 app.py -p 8080`  
   To run the server with the production backend, run 
   `BACKEND_URL="http://energycomps.its.carleton.edu:8080/api/" pipenv run python3 app.py -p 8080`  
   To run the server in debug mode, prepend `FLASK_DEBUG=1`.
