.PHONY: deploy logs

deploy:
	git pull
	sudo systemctl restart frontend

logs:
	sudo journalctl -u frontend