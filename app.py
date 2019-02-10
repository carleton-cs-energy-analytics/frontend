import sys
import flask
import json
import psycopg2


app = flask.Flask(__name__, static_folder='static', template_folder='templates')


@app.route('/')
def get_main_page():
    return flask.render_template('index.html')


@app.route('/api-test')
def get_api_page():
    return flask.render_template('api-test.html')


@app.route('/points')
def get_points_page():
    return flask.render_template('points.html')


@app.route('/anomalies')
def get_anomalies_page():
    return flask.render_template('anomalies.html')


@app.route('/search')
def get_search():
    return flask.render_template('search-engine.html')


if __name__ == '__main__':
    host = 'localhost'
    port = '8080'
    app.run(host=host, port=port)
