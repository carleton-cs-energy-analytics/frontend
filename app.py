import os
import flask
from flask import request

BACKEND_URL = os.environ.get('BACKEND_URL') or 'http://energycomps.its.carleton.edu/api/'

application = flask.Flask(__name__, static_folder='static', template_folder='templates')


@application.route('/')
def get_main_page():
    return flask.render_template('search-engine.html', backend_url=BACKEND_URL)

@application.route('/search')
def get_search():
    return flask.render_template('search-engine.html', backend_url=BACKEND_URL)

@application.route('/about')
def get_rules_page():
    return flask.render_template('about.html', backend_url=BACKEND_URL)

@application.route('/anomalies')
def get_anomaly_page():
        return flask.render_template('anomalies-heuristics-search.html', backend_url=BACKEND_URL)

@application.route('/queryTest')
def get_rooms_page():
    if request.args:

        # We have our query string nicely serialized as a Python dictionary
        args = request.args
        
        #We'll create a string to display the parameters & values
        
        serialized = ""
        for k, v in args.items(True):
            serialized += k +": " + v + ", "
        
        #Display the query string to the client in a different format
        return "(Query)" + serialized, 200

    else:

        return "No query string received", 200

@application.route('/justinDev')
def get_developer_page():
    return flask.render_template('csvToHTML/index.html', backend_url=BACKEND_URL)



if __name__ == '__main__':
    application.run()

