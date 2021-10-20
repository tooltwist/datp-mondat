// // Load our configuration from the protected_config directory.
import config from "../protected-config/websiteConfig";

export default ({ app }, inject) => {
  const api = config.api
  inject('datpConfig', config)

  inject('datpEndpoint', `${api.protocol}://${api.host}:${api.port}/${config.prefix.datp}/${api.version}`)
  inject('monitorEndpoint', `${api.protocol}://${api.host}:${api.port}/${config.prefix.monitor}/${api.version}`)
  inject('formserviceEndpoint', `${api.protocol}://${api.host}:${api.port}/${config.prefix.formservice}/${api.version}`)

  console.log(`\n\nSet endpoints:`)
  console.log(`config.prefix.formService=`, config.prefix.formservice)
  console.log(`config.prefix.datp=`, config.prefix.datp)
  console.log(`config.prefix.monitor=`, config.prefix.monitor)
}
