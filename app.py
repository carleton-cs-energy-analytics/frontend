import sys
import os
import flask
import json
import psycopg2

BACKEND_URL = os.environ.get('BACKEND_URL') or 'http://energycomps.its.carleton.edu:8080/api/'

app = flask.Flask(__name__, static_folder='static', template_folder='templates')


@app.route('/')
def get_main_page():
    return flask.render_template('index.html', backend_url=BACKEND_URL)


@app.route('/api-test')
def get_api_page():
    return flask.render_template('api-test.html', backend_url=BACKEND_URL)


@app.route('/points')
def get_points_page():
    return flask.render_template('points.html', backend_url=BACKEND_URL)


@app.route('/anomalies')
def get_anomalies_page():
    return flask.render_template('anomalies.html', backend_url=BACKEND_URL)


@app.route('/search')
def get_search():
    return flask.render_template('search-engine.html', backend_url=BACKEND_URL)


if __name__ == '__main__':
    host = 'localhost'
    port = '8080'
    app.run(host=host, port=port)
