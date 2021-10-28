/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
const REQUEST_COMPONENT = 'RequestObject'
const RESPONSE_COMPONENT = 'ResponseObject'

export function generateOpenApiSpec(service, requestViewDefinition, responseViewDefinition) {
  // Sort the fields into components
  const components = [ ]
  definitionAsObject(REQUEST_COMPONENT, requestViewDefinition, components)
  definitionAsObject(RESPONSE_COMPONENT, responseViewDefinition, components)

  // Sort the components by name, but retain the relative positioning of components with the
  // same name. i.e. if it was earlier in the list before, it should still be earlier after sorting.
  for (let i = 0; i < components.length; i++) {
    const component = components[i]
    component.sequence = i
    const name = component.name
    // Capitalize the first character
    component.componentName = name.substring(0, 1).toUpperCase() + name.substring(1)
  }
  components.sort((a, b) => {
    if (a.name < b.name) {
      return -1
    }
    if (a.name > b.name) {
      return +1
    }
    if (a.sequence < b.sequence) {
      return -1
    }
    if (a.sequence > b.sequence) {
      return +1
    }
    return 0
  })

  // Look for duplicate names. Leave the first as-is, but append _2, _3 etc for others.
  let previousName = '-----'
  let counter = 1
  for (const c of components) {
    if (c.name === previousName) {
      c.name = `${c.name}_${counter}`
      counter++
    } else {
      previousName = c.name
      counter = 1
    }
  }

  // Consolidate components with the same name and exact same fields
  //ZZZZ


  // console.log(`Components:`)
  // for (const c of components) {
  //   console.log(`   ->`, c.name, c.fields.length)
  // }


  // console.log(`components=`, components)

  // See https://swagger.io/docs/specification/about/
  let s = `# Example OpenAPI definition for view
openapi: 3.0.0
info:
  title: API for ${service}
  description: API for ${service}
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
              $ref: '#/components/schemas/${REQUEST_COMPONENT}'
      responses:
        200:
          description: successful completion
          # $ref: '#/components/schemas/${RESPONSE_COMPONENT}'

components:
  schemas:
`

  for (const component of components) {
    s += '\n'
    s += `    ${component.componentName}:\n`
    if (component.componentName === 'RequestObject') {
      s += `      description: API Request'\n`
    } else if (component.componentName === 'ResponseObject') {
      s += `      description: API Response'\n`
    } else {
      s += `      description: Component for field '${component.path}'\n`
    }
    s += `      properties:\n`
    for (const prop of component.fields) {
      if (prop.type === 'component') {
        // This field's type is a component
        s += `        ${prop.name}:\n`
        s += `          $ref: '#/components/schemas/${prop.componentName}'\n`
      } else if (prop.type === 'field') {
        // This field is a regular field
        const field = prop.field
        if (field.type === 'amount3') {
          // Three-part date
          s += `        ${prop.name}:\n`
          s += `          $ref: '#/components/schemas/InternationalAmount'\n`
        } else {
          // Standard field type
          s += `        ${prop.name}:\n`
          s += `          description: ${field.label}\n`
          s += `          type: ${field.type}\n`
        }
      }//- is a field
    }//- for

    // See if we have required fields
    let haveRequiredFields = false
    for (const prop of component.fields) {
      if (prop.type === 'field' && prop.field.properties.isMandatory) {
        haveRequiredFields = true
        break
      }
    }
    if (haveRequiredFields) {
      s += `      required:\n`
      for (const prop of component.fields) {
        if (prop.type === 'field' && prop.field.properties.isMandatory) {
          s += `      - ${prop.name}\n`
        }
      }
    }
  }//- next component

  s += `
    InternationalAmount:
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

/*
 *  Convert to an object, so we can work out the openAPI 'components'.
 *  For example, fields a and b.c will become:
 *  {
 *    type: 'root',
 *    children: [
 *      {
 *        type: 'field',
 *        path: 'a',
 *        field: ....
 *      },
 *      {
 *        type: 'component',
 *        path: 'b',
 *        children: [
 *          {
 *            type: 'field',
 *            path: 'b.c',
 *            field: ....
 *          }
 *        ]
 *      }
 *    ]
 *  }
 *
 *  We'll also create an array of the components, such as [ { name: 'b', path: 'b', definition: points at element from above }]
 *
 *  From these, we can generate the OpenAPI spec.
 */
function definitionAsObject(componentName, viewDefinition, components) {
  const root = {
    type: 'component',
    name: componentName,
    path: '',
    fields: [ ],
    index: { }
  }
  components.push(root)

  for (const field of viewDefinition.fields) {
    const fieldPath = field.name
    // console.log(`*** `, fieldPath)
    const parts = fieldPath.split('.')
    // Every part of the name except the final part, will become a "component"
    let parent = root
    let parentPath = ''
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      // console.log(`  ${i}  ${part}`)
      const myPath = `${parentPath}${(i > 0) ? '.' : ''}${part}`
      let component = parent.index[part]
      if (!component) {
        // console.log(`  - add component ${part} to ${parent.type} ${parent.name}`)
        component = {
          type: 'component',
          name: part,
          path: myPath,
          fields: [ ],
          index: { }
        }
        parent.fields.push(component)
        parent.index[part] = component
        components.push(component)
      }
      parent = component
      parentPath = myPath
    }

    // Now add the field. We can assume it does not already exist
    const finalPart = parts[parts.length - 1]
    // console.log(`  + add field ${finalPart} to ${parent.type} ${parent.name}`)

    parent.fields.push({
      type: 'field',
      name: finalPart,
      path: fieldPath,
      field
    })
  }
}
