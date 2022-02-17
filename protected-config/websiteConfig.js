/*
 *  This file gets overwritten during production deployments,
 *  using a config file copied from /secure-config/website/overlay.
 */
export default {
  website : {
    protocol: 'http',
    host: 'localhost',
    port: 33380,
  },
  api: {
    protocol: 'http',

    // // Phil's AWS account in us-east-1
    // host: 'ec2co-ecsel-1cczhydjd93vi-698147999.us-east-1.elb.amazonaws.com',
    // port: 80,

    // // Inside Visual Studio Code
    // host: 'localhost',
    // port: 33370,

    // Standalone SERVER
    host: 'localhost',
    port: 4000,

    // // Inside Docker
    // host: 'localhost',
    // port: 4000,

    version: '1.0',
  },
  prefix: {
    monitor: 'mondat-api',
    datp: 'datp',
    formservice: 'formservice'
  }
}
