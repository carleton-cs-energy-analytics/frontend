# frontend

The User-facing website with "dashboards", etc.

## Running for Development

1) Run `pipenv install`

2) To run the server with your own backend, run 
   `BACKEND_URL="http://localhost:5000/api/" pipenv run python3 app.py -p 8080`  
   To run the server with the production backend, run 
   `pipenv run python3 app.py -p 8080`  
   To run the server in debug mode, prepend `FLASK_DEBUG=1`.
   
## Running for Production

This repository should be cloned to `/var/www/frontend`
There is a systemd unit file at `/etc/systemd/system/frontend.service`, which should have the following contents:

    [Unit]
    Description=Gunicorn instance to serve frontend
    After=network.target
    
    [Service]
    User=energy
    Group=energycomps
    WorkingDirectory=/var/www/frontend
    ExecStart=/usr/bin/make run
    
    [Install]
    WantedBy=multi-user.target
    
To re-deploy the latest version, there's a Make rule (`deploy`) which simply does a `git pull`, 
and then restarts the systemd unit.
For information about how the frontend is exposed via reverse proxy, see the backend readme.  
   
   
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

1) Determine what is anomalous by visualizing from the anomalies tab
   - Select group of points and date range in the same way as the trends UI.
   - Add a value query to determine what should be considered anomalous. The syntax for any single query is `~ inequality value` (with no spaces). They can be made more complicated by adding a space, any boolean operator (i.e. `and`, `or`, and `not`), a space, and another query. `(` and `)` can be used to make more complex queries. For example, `(~<=70 or ~=40) and ~>8.3` would be a valid query.
   - Plot the graph in the same way as the trends UI. Any points that ever had a value that matched the value query will have their line colored red. Their point name will show up to the right of the graph.
2) Make a rule
   - Select points and values as described above, but instead of clicking `Graph`, click `Create New Rule`.
   - Give it a descriptive name.
   - You will be notified via a daily email if a value ever matches this rule.
3) Manage rules
   - Go to the rules tab.
   - Click `Rename` to change the user-facing name of the rule that is displayed in the rules management page and on the email.
   - Click `Delete` to delete a rule entirely (you will not be notified about a rule if this is done).
   - Click `View` to view the results for a given rule
      - You can "edit" a rule by viewing it, tweaking the point or value query, creating a new rule, and deleting the original rule.
   
      
TODO: You can currently do value queries (and make rules) for non-numeric values, but we don't have functionality yet for visualizing those anomalies. Additionally, the syntax for value queries was never meant to be user facing, so the UI could certainly be improved here in the future. Potentionally, combining the anomalies and trends tab could be good as well.
