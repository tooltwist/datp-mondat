import axios from 'axios'

const METADATA_STRING_PREFIX = 'ZXSTRING'
const METADATA_NUMBER_PREFIX = 'ZXNUMBER'
const METADATA_BOOLEAN_PREFIX = 'ZXBOOL'
const METADATA_SEPARATOR = ':::'


export default {
  viewName,
  mappingId,
  getView,
  getMapping,
  mergeInFieldDefinition,
  fieldsToObject,
  unscrambleLineOfJson,
  addMapping,
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
  let url = `http://localhost:57990/formservice/view/${viewName}`;
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


function fieldsToObject(fields, embedMetadata) {
  const result = { }

  for (const field of fields) {
    // Create the ancestors as required
    const path = field.name
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
        case '':
        case null:
        case 'string':
          if (embedMetadata) {
            parent[name] = `${METADATA_STRING_PREFIX}${METADATA_SEPARATOR}abcd${METADATA_SEPARATOR}${path}`
          } else {
            parent[name] = `abcd`
          }
          break
        case 'number':
          if (embedMetadata) {
            parent[name] = `${METADATA_NUMBER_PREFIX}${METADATA_SEPARATOR}123${METADATA_SEPARATOR}${path}`
          } else {
            parent[name] = 123
          }
          break
        case 'booean':
          if (embedMetadata) {
            parent[name] = `${METADATA_BOOLEAN_PREFIX}${METADATA_SEPARATOR}true${METADATA_SEPARATOR}${path}`
          } else {
            parent[name] = true
          }
          break
        default:
          alert(`Unknown type ${field.type} - ${name}`)
          parent[name] = '?'
      }
    }
  }
  return result
}

/**
 * The 'fieldsToObject' function messes with the values given to the JSON object
 * it creates, so we can pass metadata about the field through JSON.stringfy(obj, '', 2).
 * To unscramble, use this function to convert each line at JSON back to it's correct
 * format and extract the metadata.
 *
 * @param {String} line A single line of pretty formatted JSON (i.e. one property per line)
 */
function unscrambleLineOfJson(line) {

  // See if it's a string
  let pos1 = line.indexOf(METADATA_STRING_PREFIX)
  if (pos1 > 0) {
    const arr = line.substring(pos1).split(METADATA_SEPARATOR)
    let path = arr[2]
    if (path.endsWith('",')) {
      path = path.substring(0, path.length - 2)
      line = `${line.substring(0, pos1)}${arr[1]}",`
    } else {
      path = path.substring(0, path.length - 1)
      line = `${line.substring(0, pos1)}${arr[1]}"`
    }
    return { line, path }
  }

  // See if it's a number
  let pos2 = line.indexOf(METADATA_NUMBER_PREFIX)
  if (pos2 > 0) {
    const arr = line.substring(pos2).split(METADATA_SEPARATOR)
    let path = arr[2]
    if (path.endsWith('",')) {
      path = path.substring(0, path.length - 2)
      line = `${line.substring(0, pos2)}${arr[1]},`
    } else {
      path = path.substring(0, path.length - 1)
      line = `${line.substring(0, pos2)}${arr[1]}`
    }
    return { line, path }
  }

  // See if it's a boolean
  let pos3 = line.indexOf(METADATA_BOOLEAN_PREFIX)
  if (pos3 > 0) {
    const arr = line.substring(pos3).split(METADATA_SEPARATOR)
    let path = arr[2]
    if (path.endsWith('",')) {
      path = path.substring(0, path.length - 2)
      line = `${line.substring(0, pos3)}${arr[1]},`
    } else {
      path = path.substring(0, path.length - 1)
      line = `${line.substring(0, pos3)}${arr[1]}`
    }
    return { line, path }
  }

  // No metadata
  return { line, path: '' }
}


async function getMapping(mappingId) {
  const url = `http://localhost:57990/formservice/mapping/${mappingId}`;
  // console.log(`url=`, url);
  const reply = await axios.get(url);
  const mapping = reply.data;
  // console.log(`mapping=`, mapping)

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


async function addMapping(mappingId, version, fieldName, source, converter) {
  console.log(`addMapping(${mappingId}, ${version}, ${fieldName}, ${source}, ${converter})`)
  const url = `http://localhost:57990/formservice/mapping`
  // console.log(`url=`, url)
  const params = {
    mappingId,
    version,
    fieldName,
    source
  }
  if (converter) {
    params.converter = converter
  }
  const reply = await axios.post(url, params)
  return reply
}