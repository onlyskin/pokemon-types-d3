#!/bin/bash

SRC=src
OUT=out
TSC=node_modules/typescript/bin/tsc
BROWSERIFY=node_modules/browserify/bin/cmd.js

rm -rf $OUT
mkdir -p $OUT

$TSC 
$BROWSERIFY -o $OUT/index.bundle.js $OUT/src/index.js

cp index.html $OUT/index.html
cp css/* $OUT/
