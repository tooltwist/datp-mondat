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
    prefix: 'mondat',
    version: '1.0',
  }
}
