#!/bin/bash
#
#	Start the application in a Docker server.
#
#	We don't want to hard code the deployment configuration into
#	the Docker container, so instead we copy environment.js from
#	the volume for the server before running the server.
#
echo ""
echo "start_inside_docker_container.sh"
echo "--------------------------------"
echo JUICE_CONFIG=${JUICE_CONFIG}
echo WEBSITE_PORT=${WEBSITE_PORT}
echo "$" cd /src
         cd /src

# The browser-based files are unable to access Juice to get their config,
# so we hack the distribution files directly to replace config variables
# (i.e. $JUICE{...}) using Juice-client from the command line.
CMD=node_modules/\@tooltwist/juice-client/bin/juice-cli.js
GENERATE_CONFIG=Y
if [ "${GENERATE_CONFIG}" == "Y" ] ; then

    #
    # Do $JUICE{...} substitution wherever required in the dist directory.
    #
    echo "Checking for website files using JUICE variables..."
    for filename in $(grep -rl '\$JUICE{' /src/dist/) ; do
        echo Converting ${filename}
        newfile=${filename}-replacement-file
        origfile=${filename}-original-file
        node ${CMD} install ${filename} ${newfile}
        mv ${filename} ${origfile}
        mv ${newfile} ${filename}
    done
fi

#echo "Starting the API server using pm2..."
#echo "$" exec pm2-runtime app.js --node-args="-r esm"
#         exec pm2-runtime app.js --node-args="-r esm"
#echo "$" exec node -r esm app.js
#         exec node -r esm app.js
echo "$" exec node node_modules/nuxt/bin/nuxt.js start
         exec node node_modules/nuxt/bin/nuxt.js start
