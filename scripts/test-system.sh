#!/bin/sh

ARGS="$@"
if [ -z "${ARGS}" ]; then
    ARGS='test/system/**/*.spec.ts'
fi

TS_NODE_PROJECT=tsconfig-test.json mocha --recursive --exit --timeout 5000 -r ts-node/register $ARGS;