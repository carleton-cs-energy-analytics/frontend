#!/bin/bash

cd ~/var/www/frontend/static/images/archive

mkdir "$(date +"%y-%m-%d")"

cd ~/var/www/frontend/static/images

cp * ~/var/www/frontend/static/images/archive
