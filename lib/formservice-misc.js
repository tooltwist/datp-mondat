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
  console.trace('mergeInFieldDefinition()')
  // console.log(`---- mergeInFieldDefinition`)
  // console.log(`from=`, from)
  // console.log(`to=`, to)

  to.name = from.name
  to.label = from.label
  to.exampleValue = from.exampleValue
  to.defaultValue = from.defaultValue
  to.allowableValues = from.allowableValues
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

async function getView(endpoint, viewName, createIfNotFound) {
  // console.log(`formservice-misc.getView(endpoint=${endpoint}, viewName=${viewName}, createIfNotFound=${createIfNotFound})`)
  if (!viewName) {
    console.error(`forservice.getView(): viewName cannot be null`)
    return null
  }

  let url = `${endpoint}/view/${viewName}`;
  if (createIfNotFound) {
    url += '?createIfNotFound=true'
  }
  //console.log(`url=`, url);
  const reply = await axios.get(url);
  //console.log(`viewsX=`, reply.data);
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

/**
 * The 'fieldsToObject' function messes with the values given to the JSON object
 * it creates, so we can pass metadata about the field through JSON.stringfy(obj, '', 2).
 * To unscramble, use this function to convert each line at JSON back to it's correct
 * format and extract the metadata.
 *
 * @param {String} line A single line of pretty formatted JSON (i.e. one property per line)
 */
function fieldsToObject(fields, embedMetadata) {
  // console.log(`fieldsToObject()`)
  // console.log(`  fields=`, fields)
  // console.log(`  embedMetadata=`, embedMetadata)

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
        case 'date':
        case 'string':
          const exampleString = field.exampleValue ? field.exampleValue : 'abc'
          if (embedMetadata) {
            parent[name] = `${METADATA_STRING_PREFIX}${METADATA_SEPARATOR}${exampleString}${METADATA_SEPARATOR}${path}`
          } else {
            parent[name] = exampleString
          }
          break
        case 'number':
          let exampleNumber = 123
          try { exampleNumber = parseInt(field.exampleValue) } catch (e) { }
          if (embedMetadata) {
            parent[name] = `${METADATA_NUMBER_PREFIX}${METADATA_SEPARATOR}${exampleNumber}${METADATA_SEPARATOR}${path}`
          } else {
            parent[name] = exampleNumber
          }
          break
          // case 'number':
          //   if (embedMetadata) {
          //     parent[name] = `${METADATA_NUMBER_PREFIX}${METADATA_SEPARATOR}123${METADATA_SEPARATOR}${path}`
          //   } else {
          //     parent[name] = 123
          //   }
          //   break
        case 'integer':
          let exampleInt = 123
          try { exampleInt = parseInt(field.exampleValue) } catch (e) { }
          if (embedMetadata) {
            parent[name] = `${METADATA_NUMBER_PREFIX}${METADATA_SEPARATOR}${exampleInt}${METADATA_SEPARATOR}${path}`
          } else {
            parent[name] = 123
          }
          break
        case 'float':
          let exampleFloat = 123.456
          try { exampleFloat = parseFloat(field.exampleValue) } catch (e) { }
          if (embedMetadata) {
            parent[name] = `${METADATA_NUMBER_PREFIX}${METADATA_SEPARATOR}${exampleFloat}${METADATA_SEPARATOR}${path}`
          } else {
            parent[name] = exampleFloat
          }
          break
        case 'amount':
          if (embedMetadata) {
            parent[name] = `${METADATA_NUMBER_PREFIX}${METADATA_SEPARATOR}123.45${METADATA_SEPARATOR}${path}`
          } else {
            parent[name] = 123
          }
          break
        case 'amount3':
          if (embedMetadata) {
            parent[name] = `${METADATA_STRING_PREFIX}${METADATA_SEPARATOR}(PHP / 12345 / 2)${METADATA_SEPARATOR}${path}`
          } else {
            parent[name] = {
              "currency": "PHP",
              "unscaledAmount": 12345,
              "scale": 2
            }
          }
          break
        case 'boolean':
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
  // console.log(`result=`, result)
  return result
}

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
  const pos2 = line.indexOf(`"${METADATA_NUMBER_PREFIX}`)
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
  const pos3 = line.indexOf(`"${METADATA_BOOLEAN_PREFIX}`)
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

async function getMapping (endpoint, mappingId) {
  const url = `${endpoint}/mapping/${mappingId}`
  // console.log(`url=`, url);
  const reply = await axios.get(url)
  const mapping = reply.data
  return mapping
}

async function addMapping (endpoint, mappingId, version, fieldName, source, converter) {
  // console.log(`addMapping(${mappingId}, ${version}, ${fieldName}, ${source}, ${converter})`)
  const url = `${endpoint}/mapping`
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