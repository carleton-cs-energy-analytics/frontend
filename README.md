# frontend

## Running for development

1) Run `pipenv install`

2) To run the server with your own backend, run 
   `BACKEND_URL="http://localhost:5000/api/" pipenv run python3 app.py -p 8080`  
   To run the server with the production backend, run 
   `BACKEND_URL="http://energycomps.its.carleton.edu:8080/api/" pipenv run python3 app.py -p 8080`  
   To run the server in debug mode, prepend `FLASK_DEBUG=1`.
   
   
## Using the Trends UI

1) Select group of points
   - Use the point selector tool to filter down to the selection of points you would like to plot. Text to the right of the            submit button will show how many points match the current filters
2) Select date range
   - Select a date range over which you would like to plot values for the selected group of points. 
   - Selecting a date range in the future will cause the graph to show no value for those future days. 
   - The start and stop time refer to the exact start and end time of the range, not the time range for each day for all days in the range. 
3) Plot
   - To plot data, press the graph button. A linegraph should appear for points of type numeric, float, or integer. A heatmap will be used for points of all other types. 
   - If the graph button is pressed and no graph appears check the following: 
      - If there are zero points that match the point filters, then no graph will appear.
      - If there are no values for the the date range selected, then no graph will appear.
      - If the selection of points includes numeric types and non-numeric types, then no graph will appear. 
      - If the above three cases are not relevant and there is still no graph, then there could be a technical issue with reaching the database. 



## Using the Anomaly Alerts System
