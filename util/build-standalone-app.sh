#!/bin/bash
#
#
dir=$(cd `dirname $0`; pwd)
#echo dir=${dir}

cd ${dir}/..
yarn build && yarn generate && yarn tauri build

#yarn build && yarn generate && yarn tauri build --debug

