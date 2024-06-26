#!/bin/bash


APP_PATH="/home/ubuntu/tsensor_cloud/app.py"
PID_FILE="/var/run/tsensor_cloud/tsensor_web_app.pid"


start() {

    if [ -f $PID_FILE ]; then
        echo "The service is already running."
    else
        nohup /home/ubuntu/tsensor_cloud/virtualenv/bin/gunicorn --bind 0.0.0.0:5000 wsgi:app &> /dev/null &
        echo $! > $PID_FILE
        echo "Service started."
    fi
}

stop() {
    if [ -f $PID_FILE ]; then
        kill $(cat $PID_FILE)
        rm $PID_FILE
        echo "Service stopped."
    else
        echo "The service is not running."
    fi
}

restart() {
    stop
    start
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
esac