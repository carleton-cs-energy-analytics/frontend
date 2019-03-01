import os
import flask

BACKEND_URL = os.environ.get('BACKEND_URL') or 'http://energycomps.its.carleton.edu/api/'

application = flask.Flask(__name__, static_folder='static', template_folder='templates')


@application.route('/')
def get_main_page():
    return flask.render_template('search-engine.html', backend_url=BACKEND_URL)


@application.route('/points')
def get_points_page():
    return flask.render_template('points.html', backend_url=BACKEND_URL)


@application.route('/search')
def get_search():
    return flask.render_template('search-engine.html', backend_url=BACKEND_URL)


@application.route('/rules')
def get_rules_page():
    return flask.render_template('rules.html', backend_url=BACKEND_URL)


@application.route('/anomalies')
def get_anomaly_page():
    return flask.render_template('anomalies.html', backend_url=BACKEND_URL)


if __name__ == '__main__':
    application.run()
