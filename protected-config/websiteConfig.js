/*
 *  This file gets overwritten during production deployments,
 *  using a config file copied from /secure-config/website/overlay.
 */
export default {
  website : {
    protocol: 'http',
    host: 'localhost',
    port: 3000,
  },
  api: {
    protocol: 'http',
    host: 'localhost',
    port: 57990,
    prefix: 'mondat',
    version: '1.0',
  }
}
