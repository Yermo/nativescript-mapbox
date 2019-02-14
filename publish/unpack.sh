#!/bin/sh

pwd

mkdir dist
cd dist
rm -rf package
tar xzvf ../package/*tgz
