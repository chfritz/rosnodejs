var xmlrpc      = require('xmlrpc');
var environment = require('./environment');

var master = exports;

master.registerPublisher = function(publisher, callback) {
 var masterUri   = environment.getRosMasterUri()
   , callerUri   = publisher.callerUri
   , callerId    = getGraphResourceName(publisher.callerId)
   , topicName   = getGraphResourceName(publisher.topic)
   , messageType = publisher.messageType
   , params      = [callerId, topicName, messageType, callerUri]
   , client      = xmlrpc.createClient(masterUri)
   ;

  client.methodCall('registerPublisher', params, function(error, value) {
    parseResponse(error, value, callback);
  });
};

master.unregisterPublisher = function(publisher, callback) {
  var masterUri = environment.getRosMasterUri()
    , callerUri = publisher.callerUri
    , callerId  = getGraphResourceName(publisher.callerId)
    , topicName = getGraphResourceName(publisher.topic)
    , params    = [callerId, topicName, callerUri]
    , client    = xmlrpc.createClient(masterUri)
    ;

  client.methodCall('unregisterPublisher', params, function(error, value) {
    parseResponse(error, value, callback);
  });
};

master.registerSubscriber = function(subscriber, callback) {
  var masterUri   = environment.getRosMasterUri()
    , callerUri   = subscriber.callerUri
    , callerId    = getGraphResourceName(subscriber.callerId)
    , topicName   = getGraphResourceName(subscriber.topic)
    , messageType = subscriber.messageType
    , params      = [callerId, topicName, messageType, callerUri]
    , client      = xmlrpc.createClient(masterUri)
    ;

  client.methodCall('registerSubscriber', params, function(error, value) {
    parseResponse(error, value, callback);
  });
};

master.unregisterSubscriber = function(subscriber, callback) {
  var masterUri = environment.getRosMasterUri()
    , callerUri = subscriber.callerUri
    , callerId  = getGraphResourceName(subscriber.callerId)
    , topicName = getGraphResourceName(subscriber.topic)
    , params    = [callerId, topicName, callerUri]
    , client    = xmlrpc.createClient(masterUri)
    ;

  client.methodCall('unregisterSubscriber', params, function(error, value) {
    parseResponse(error, value, callback);
  });
};

/** lookupService(caller_id, service)

  Lookup all provider of a particular service.

  @param caller_id (str): ROS caller ID
  @param service (str): Fully-qualified name of service
  @return (int, str, str) (code, statusMessage, serviceUrl) service
  URL is provides address and port of the service. Fails if there is
  no provider.
*/
master.lookupService = function(caller_id, service, callback) {
  var masterUri = environment.getRosMasterUri();
  var callerId  = getGraphResourceName(caller_id);
  var serviceName = getGraphResourceName(service);

  xmlrpc.createClient(masterUri).methodCall(
    'lookupService', 
    [callerId, serviceName], 
    function(error, value) {
      parseResponse(error, value, callback);
    });  
};


// ---------------------------------------------------------

function getGraphResourceName(name) {
  var graphResourceName = name;
  if (name.charAt(0) !== '/') {
    graphResourceName = '/' + graphResourceName;
  }

  return graphResourceName;
}

function parseResponse(error, response, callback) {
  var value = null;

  // Determines if an error or value based on the response.
  if (!error) {
    // The standard format response for ROS is:
    //  [0] status code
    //  [1] status message
    //  [2] value
    if (response instanceof Array && response.length >= 2) {
      // Status codes of <= 0 are considered errors.
      if (response[0] <= 0) {
        error = new Error(response[1]);
        error.code = response[0];
      }
      else {
        value = true;
        // If a value is specified in the response, use it.
        if (response.length === 3) {
          value = response[2];
        }
      }
    }
    // The response does not match ROS' standard format.
    else {
      error = new Error('Master returned an invalid response.');
    }
  }

  callback(error, value);
}

