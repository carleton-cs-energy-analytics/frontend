import os
import flask

BACKEND_URL = os.environ.get('BACKEND_URL') or 'http://energycomps.its.carleton.edu:8080/api/'

app = flask.Flask(__name__, static_folder='static', template_folder='templates')


@app.route('/')
def get_main_page():
    return flask.render_template('search-engine.html', backend_url=BACKEND_URL)


@app.route('/points')
def get_points_page():
    return flask.render_template('points.html', backend_url=BACKEND_URL)


@app.route('/search')
def get_search():
    return flask.render_template('search-engine.html', backend_url=BACKEND_URL)


if __name__ == '__main__':
    host = 'localhost'
    port = '8080'
    app.run(host=host, port=port)
