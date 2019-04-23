#!/bin/bash

[[ -z "${JWT_SECRET}" ]] && export JWT_SECRET='anything'
[[ -z "${ALERT_EMAIL}" ]] && export ALERT_EMAIL='anything'
[[ -z "${TEST_API_GATEWAY_HOST}" ]] && export TEST_API_GATEWAY_HOST='localhost'
[[ -z "${TEST_API_GATEWAY_PORT}" ]] && export TEST_API_GATEWAY_PORT=3000
[[ -z "${STAGE}" ]] && export STAGE=local
[[ -z "${SECURITY_GROUP}" ]] && export SECURITY_GROUP=demo-9999
[[ -z "${SUBNET_A}" ]] && export SUBNET_A=subnet-9999a
[[ -z "${SUBNET_B}" ]] && export SUBNET_B=subnet-9999b
[[ -z "${DB_HOST}" ]] && export DB_HOST=localhost
[[ -z "${DB_PORT}" ]] && export DB_PORT=3306
[[ -z "${DB_NAME}" ]] && export DB_NAME=test
[[ -z "${DB_USER}" ]] && export DB_USER=root
[[ -z "${DB_TYPE}" ]] && export DB_TYPE=mysql

if [ $TEST_API_GATEWAY_PORT != 443 ]
then
# start the API using serverless
nohup serverless offline start --stage local \
          --host $TEST_API_GATEWAY_HOST \
          --port $TEST_API_GATEWAY_PORT \
          --DbHost $DB_HOST \
          --DbPort $DB_PORT \
          --DbUser $DB_USER \
          --DbPwd $DB_PWD \
          --alert-email $ALERT_EMAIL & echo $!
# store the process ID
serverless_pid=$!

# wait for serverless
# https://unix.stackexchange.com/questions/5277/how-do-i-tell-a-script-to-wait-for-a-process-to-start-accepting-requests-on-a-po
while ! echo exit | nc $TEST_API_GATEWAY_HOST $TEST_API_GATEWAY_PORT; do sleep 5; done

# Add exit handler to kill processes on termination of the script
# trap "kill $kinesalite_pid && kill $stream_pid && kill $serverless_pid" EXIT
# we are not currently utilizing kinesis, so for now, we are not capturing the $stream_pid
# trap "kill $stream_pid && kill $serverless_pid" EXIT
trap "kill $serverless_pid" EXIT
fi
# run tests
grunt --dbug --stack tslint mochaTest:test
MOCHA_RESULT=$?

# wait for data to be written to the stream
sleep 5

echo "Exiting: $MOCHA_RESULT"
exit $MOCHA_RESULT
