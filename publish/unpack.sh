#!/bin/sh

pwd

mkdir -p dist
cd dist
rm -rf package
tar xzvf ../package/*tgz
