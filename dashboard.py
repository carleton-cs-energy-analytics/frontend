import sys
import flask
import json
import psycopg2

app = flask.Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def get_main_page():
    return flask.render_template('index.html')




if __name__ == '__main__':
    host = 'localhost'
    port = '8080'
    app.run(host=host, port=port)
