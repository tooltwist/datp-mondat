

export function generateOpenApiSpec(viewDefinition) {
  console.log(`viewDefinition=`, viewDefinition)

  const operationCC = 'RequestObject'


  // See https://swagger.io/docs/specification/about/
  let s = `# Example OpenAPI definition for view
openapi: 3.0.0
info:
  title: API for ${viewDefinition.name}
  description: API for ${viewDefinition.name}
  version: 1.0.0
  contact:
    email: you@your.company.com

  license:
    name: Proprietary, copyright code

# tags are used for organizing operations
tags:
- name: admins
  description: Secured Admin-only calls
- name: developers
  description: Operations available to regular developers

paths:
  # This is a path endpoint. Change it.
  /xyz/ZZZZ:
    post:
      tags:
      - developers
      summary: Some description
      description: |
        Some description
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/${operationCC}'
      responses:
        200:
          description: successful completion

components:
  schemas:
    ${operationCC}:
      description: ${operationCC} object
      properties:`
  for (const fld of viewDefinition.fields) {
    if (fld.type === 'amount3') {
      s += `
        ${fld.name}:
          $ref: '#/components/schemas/${operationCC}'`
    } else {
      s += `
        ${fld.name}:
          description: ${fld.label}
          type: ${fld.type}`
    }
  }
  s += `
      required:`
  for (const fld of viewDefinition.fields) {
    if (fld.properties.isMandatory) {
      s += `
        - ${fld.name}`
    }
  }
  s += `
    Amount3:
      description: International currency amount
      properties:
        currency:
          description: Currency Code
          type: string
        unscaledAmount:
          description: Amount in smallest unit of currency
          type: integer
        scale:
          description: Scaling factor
          type: integer
`
  return s
}
