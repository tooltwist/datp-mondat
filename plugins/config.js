/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
// // Load our configuration from the protected_config directory.
import config from "../protected-config/websiteConfig"

export default ({ app }, inject) => {
  const api = config.api
  inject('datpConfig', config)

  inject('datpEndpoint', `${api.protocol}://${api.host}:${api.port}/${config.prefix.datp}/${api.version}`)
  inject('monitorEndpoint', `${api.protocol}://${api.host}:${api.port}/${config.prefix.monitor}/${api.version}`)
  inject('formserviceEndpoint', `${api.protocol}://${api.host}:${api.port}/${config.prefix.formservice}/${api.version}`)

  // console.log(`\n\nSet endpoints:`)
  // console.log(`config.prefix.formService=`, config.prefix.formservice)
  // console.log(`config.prefix.datp=`, config.prefix.datp)
  // console.log(`config.prefix.monitor=`, config.prefix.monitor)
}
