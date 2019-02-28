import smtplib
from email.message import EmailMessage
import json
import requests
import datetime

BACKEND_URL = 'http://energycomps.its.carleton.edu:8080/api/'


def get_date():
    current_date = datetime.datetime.now().date()
    timedelta = datetime.timedelta(1)  # We want the date for yesterday because we will be sending this in the morning
    return str(current_date - timedelta)


def get_anomalous_rules():
    rules = requests.get(BACKEND_URL + 'rules').json()

    anomalous_rules = []
    for rule in rules:
        num_anomalies = requests.get(BACKEND_URL + rule['id'] + '/count').json()[0]
        if num_anomalies > 0:
            rule['num_anomalies'] = num_anomalies
            anomalous_rules.append(rule)

    # For testing purposes if there are no anomalies.
    # anomalous_rules.append({'name': 'eva\'s rule', 'id': 0, 'num_anomalies': 1000})
    return anomalous_rules


def construct_msg_body():
    anomalous_rules = get_anomalous_rules()

    # This is the case were no anomalies were sent.
    if len(anomalous_rules) == 0:
        return ''

    msg_body = 'The rules broken yesterday and the number of values that flagged that rule are as follows.\n\n'
    for rule in anomalous_rules:
        msg_body += rule['name'] + ': ' + str(rule['num_anomalies']) + '\n'

    msg_body += '\nFor more information go to the following address.'  # TODO: FIGURE OUT WHAT THIS SHOULD BE
    return msg_body


def send_email(msg_body):
    # In this case, no anomalies were found, so we should not send the email.
    if msg_body == '':
        return

    # Create a text/plain message
    msg = EmailMessage()
    msg['Subject'] = 'Anomalies detected on ' + get_date()  # Should probably make this better
    msg['From'] = 'grenche@carleton.edu'  # what address do we send from???
    msg['To'] = 'grenche@carleton.edu'  # what address do we send to???
    msg.set_content(msg_body)

    # Is this how we want to do it?
    server = smtplib.SMTP('smtp.carleton.edu', 587)
    server.starttls()
    server.login('grenche@carleton.edu', 'password') # Don't worry. This is not my real password.
    server.send_message(msg)


def main():
    send_email(construct_msg_body())


if __name__ == '__main__':
    main()
