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
    host: 'localhost',
    port: 33370,
    version: '1.0',
  },
  prefix: {
    monitor: 'mondat',
    datp: 'datp',
    formservice: 'formservice'
  }
}
