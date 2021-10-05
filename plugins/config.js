// // Load our configuration from the protected_config directory.
import config from "../protected-config/websiteConfig";

export default ({ app }, inject) => {
  const api = config.api
  const endpoint = `${api.protocol}://${api.host}:${api.port}/${api.prefix}/${api.version}`;
  inject('daptConfig', config)
  inject('daptEndpoint', endpoint)
}
