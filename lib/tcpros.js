var ctype = require('ctype')
  , ros   = require('./ros')

var tcpros = exports

tcpros.getPublishBuffer = function(connectionHeader) {
  var headerBuffer  = this.getBufferFromConnectionHeader(connectionHeader)
    , messageBuffer = this.getBufferFromMessage(connectionHeader.message)

  var buffer = new Buffer(headerBuffer.length + messageBuffer.length)
  headerBuffer.copy(buffer, 0, 0, headerBuffer.length)
  messageBuffer.copy(buffer, headerBuffer.length, 0, messageBuffer.length)

  return buffer
}

tcpros.getConnectionHeaderFromBuffer = function(buffer) {
  var connectionHeader = {}

  var bufferOffset = 0
  var headerLength = ctype.ruint32(buffer, 'little', bufferOffset)
  bufferOffset += 4
  while (bufferOffset < headerLength) {
    var fieldLength = ctype.ruint32(buffer, 'little', bufferOffset)
    bufferOffset += 4
    var fieldStart      = bufferOffset
      , fieldEnd        = fieldStart + fieldLength
      , field           = buffer.toString('utf8', fieldStart, fieldEnd)
      , fieldComponents = field.split('=')
      , fieldName       = fieldComponents[0]
      , fieldValue      = fieldComponents[1]
    bufferOffset += fieldLength

    if (fieldName === 'callerid') {
      connectionHeader.callerId = fieldValue
    }
    else if (fieldName === 'topic') {
      connectionHeader.topic = fieldValue
    }
    else if (fieldName === 'md5sum') {
      connectionHeader.md5sum = fieldValue
    }
    else if (fieldName === 'type') {
      connectionHeader.type = fieldValue
    }
    else if (fieldName === 'message_definition') {
      connectionHeader.message_definition = fieldValue
    }
    else if (fieldName === 'latching') {
      connectionHeader.latching = parseInt(fieldValue)
    }
  }

  return connectionHeader
}

tcpros.getBufferFromConnectionHeader = function(connectionHeader) {
  var headers = []

  var callerId = connectionHeader.callerId
  if (callerId !== undefined) {
    headers.push({ key: 'callerid', value: callerId })
  }
  var topic = connectionHeader.topic
  if (topic !== undefined) {
    headers.push({ key: 'topic', value: topic })
  }
  var type = connectionHeader.type
  if (type !== undefined) {
    headers.push({ key: 'type', value: type })
  }
  var md5sum = connectionHeader.md5sum
  if (md5sum !== undefined) {
    headers.push({ key: 'md5sum', value: md5sum })
  }

  var headerLength = 0
  for (var i = 0; i < headers.length; i++) {
    headerLength += headers[i].key.length
    headerLength += headers[i].value.length
    headerLength += 1
    headerLength += 4
  }

  var buffer       = new Buffer(headerLength + 4)
    , bufferOffset = 0
  ctype.wuint32(headerLength, 'little', buffer, bufferOffset)
  bufferOffset += 4
  for (i = 0; i < headers.length; i++) {
    var headerKeyValue = headers[i].key + '=' + headers[i].value
    ctype.wuint32(headerKeyValue.length, 'little', buffer, bufferOffset)
    bufferOffset += 4
    bufferOffset += buffer.write(headerKeyValue, bufferOffset, 'ascii')
  }

  return buffer
}

tcpros.getMessageFromBuffer = function(buffer, Message) {
  var message = new Message()

  var bufferOffset = 0
  var headerLength = 0
  var messageLength = ctype.ruint32(buffer, 'little', bufferOffset)
  bufferOffset += 4
  if (messageLength < buffer.length - 4) {
    headerLength = messageLength
    bufferOffset += headerLength
    messageLength = ctype.ruint32(buffer, 'little', bufferOffset)
    bufferOffset += 4
  }
  var fieldOrder = 0
  while (bufferOffset - headerLength < messageLength) {
    var fieldLength = ctype.ruint32(buffer, 'little', bufferOffset)
    bufferOffset += 4
    var fieldStart = bufferOffset
      , fieldEnd   = fieldStart + fieldLength
      , fieldValue = buffer.toString('utf8', fieldStart, fieldEnd)
      , fieldName  = message.get('fieldOrder')[fieldOrder]
    fieldOrder++
    bufferOffset += fieldLength

    var param = {}
    param[fieldName] = fieldValue
    message.set(param)
  }

  return message
}

tcpros.getBufferFromMessage = function(message) {
  var body = []

  var fieldOrder = message.get('fieldOrder')
  for (var i = 0; i < fieldOrder.length; i++) {
    var field = fieldOrder[i]
    body.push(message.get(field))
  }

  var bodyLength = 0
  for (var i = 0; i < body.length; i++) {
    bodyLength += body[i].length
    // +4 for the field length (4 byte integer)
    bodyLength += 4
  }

  var buffer       = new Buffer(bodyLength + 4)
    , bufferOffset = 0
  ctype.wuint32(bodyLength, 'little', buffer, bufferOffset)
  bufferOffset += 4
  for (i = 0; i < body.length; i++) {
    ctype.wuint32(body[i].length, 'little', buffer, bufferOffset)
    bufferOffset += 4
    bufferOffset += buffer.write(body[i], bufferOffset, 'ascii')
  }

  return buffer
}
