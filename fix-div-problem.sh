#!/bin/bash
#
# Sass is changing it's use of '/', which causes errors in node modules.
# This utility hacks SCCS files to fix those errors.
#
# Error example:
#      DEPRECATION WARNING: Using / for division is deprecated and will be removed in Dart Sass 2.0.0.
#
#       Recommendation: math.div(str-length($svg), $slice)
#
#       More info and automated migrator: https://sass-lang.com/d/slash-div
#
#         ╷
#      17 │     $loops: ceil(str-length($svg)/$slice);
#         │                  ^^^^^^^^^^^^^^^^^^^^^^^
#         ╵
#
# See https://sass-lang.com/documentation/breaking-changes/slash-div
#
if ! which sass-migrator ; then
  echo Installing migration utility
  # npm install -g sass-migrator
  echo "$" yarn global add sass-migrator
           yarn global add sass-migrator
else
  echo Migration utility found
fi

# Now update any scss files.
echo "$" sass-migrator division node_modules/buefy/src/scss/utils/_functions.scss
         sass-migrator division node_modules/buefy/src/scss/utils/_functions.scss
