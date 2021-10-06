import axios from 'axios'

export default {
  viewName,
  mappingId,
  getView,
  getMapping,
  mergeInFieldDefinition,
  fieldsToObject,
}

function viewName(provider, service, messageType) {
  if (provider && service && messageType) {
    return `${provider}-${service}-${messageType}`
  }
  return ''
}

function mappingId(provider, service, messageType) {
  if (provider && service && messageType) {
    return `${provider}-${service}-${messageType}`
  }
  return ''
}

/**
 * Copy field definition values into an existing field definition.
 *
 * @param {Object} from Object we are copying field values from
 * @param {Object} to Existing field definition object
 */
function mergeInFieldDefinition(from, to) {
  console.log(`---- copyFieldStuff`)
  console.log(`from=`, from)
  console.log(`to=`, to)

  to.name = from.name
  to.label = from.label
  to.type = from.type
  if (from.columnName) {
    to.columnName = from.columnName
  }
  if (!to.properties) {
    to.properties = { }
  }
  for (let key in from.properties) {
    to.properties[key] = from.properties[key]
  }
}

async function getView(viewName, createIfNotFound) {
  let url = `http://0.0.0.0:4000/formservice/view/${viewName}`;
  if (createIfNotFound) {
    url += '?createIfNotFound=true'
  }
  console.log(`url=`, url);
  const reply = await axios.get(url);
  // console.log(`viewsX=`, reply.data);
  const viewDef = reply.data;

  // Patch in reference descriptions
  for (const field of viewDef.fields) {
    if (field.reference) {
      field._reference = field.reference.view;
    }
    // field._sequence = 0 // We can increment this to force display update
  }

  for (const field of viewDef.fields) {
    // field._id = this.fieldId++;
    // Check all properties are defined, even if not return by the API (so they are reactive)
    if (!field.properties) field.properties = {};
    if (!field.properties.isPrimaryKey){
      field.properties.isPrimaryKey = false;}
    if (!field.properties.isDescription){
      field.properties.isDescription = false;}
    if (!field.properties.isMandatory) {field.properties.isMandatory = false;}
    if (!field.properties.readonly) {field.properties.readonly = false;}
    if (!field.properties.dollars2) {field.properties.dollars2 = false;}
  }
  return viewDef
}


function fieldsToObject(fields) {
  const result = { }

  for (const field of fields) {
    // Create the ancestors as required
    let name = field.name
    let parent = result
    let pathSoFar = ''
    for ( ; ; ) {
      const pos = name.indexOf('.')
      if (pos < 0) {
        break
      }
      const prefix = name.substring(0, pos)
      name = name.substring(pos + 1)
      pathSoFar += prefix + '.'

      let newParent = parent[prefix]
      switch (typeof(newParent)) {
        case 'undefined':
          parent = parent[prefix] = { }
          break
        case 'object':
          parent = newParent
          break
        default:
          console.log(`Error: path is used as object and also value: ${pathSoFar}`)
          name = parent = null // force finishing
      }
    }
    if (name) {
      switch (field.type) {
        case 'string': parent[name] = 'abcd'; break
        case 'number': parent[name] = 123; break
        case 'booean': parent[name] = true; break
        default: parent[name] = '?'
      }
    }
  }
  return result
}


async function getMapping(mappingId) {
  const url = `http://0.0.0.0:4000/formservice/mapping/${mappingId}`;
  // console.log(`url=`, url);
  const reply = await axios.get(url);
  const mapping = reply.data;
  console.log(`mapping=`, mapping)

  // // Patch in reference descriptions
  // for (const field of viewDef.fields) {
  //   if (field.reference) {
  //     field._reference = field.reference.view;
  //   }
  //   // field._sequence = 0 // We can increment this to force display update
  // }

  // for (const field of viewDef.fields) {
  //   // field._id = this.fieldId++;
  //   // Check all properties are defined, even if not return by the API (so they are reactive)
  //   if (!field.properties) field.properties = {};
  //   if (!field.properties.isPrimaryKey){
  //     field.properties.isPrimaryKey = false;}
  //   if (!field.properties.isDescription){
  //     field.properties.isDescription = false;}
  //   if (!field.properties.isMandatory) {field.properties.isMandatory = false;}
  //   if (!field.properties.readonly) {field.properties.readonly = false;}
  //   if (!field.properties.dollars2) {field.properties.dollars2 = false;}
  // }
  return mapping
}
