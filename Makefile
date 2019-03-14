.PHONY: deploy logs run

deploy:
	git pull
	sudo systemctl restart frontend

logs:
	sudo journalctl -u frontend

# This rule is only intended to be used by the systemd unit.
run:
	/usr/bin/pipenv run gunicorn --workers 3 --bind unix:frontend.sock app
