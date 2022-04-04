/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */

//
// This is used to get the status code for HTTP requests that do not cause an
// exception to be thrown. Normally the $axios.$xxxx() functions return
// response.data, so response.status and response.statusText are not available.
// See https://stackoverflow.com/a/50176112/1350573
//
export default function ({ $axios, redirect }) {
  $axios.onResponse(response => {
    if (response.data === '') {
      response.data = { }
    }
    if (typeof(response.data) === 'object') {
      response.data._status = response.status
      response.data._statusText = response.statusText
    }
    return response
  })
}