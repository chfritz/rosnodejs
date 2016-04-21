var url = require('url');
var master = require('./master');
var messages = require('./messages');
var TCPROS = require('./tcpros');

var ros = exports;
ros.topic = require('./topic');

ros.types = function(types, callback) {
  var that = this;
 
  var Messages = [];
  types.forEach(function(type) { 
   messages.getMessage(type, function(error, Message) {
      Messages.push(Message);
      if (Messages.length === types.length) {
        callback.apply(that, Messages);
      }
    });
  });
};


// DEBUG
ros.master = master;
ros.tcpros = new TCPROS({
  node        : "nodejs_service_caller"
});

// ros.messages = messages; // DEBUG

/** call a service */
ros.call = function(serviceName, serviceType, values, callback) {
  master.lookupService("rosnodejs", serviceName, function(error, uri) { 
    var parsedUrl = url.parse(uri);
    messages.getServiceRequest(serviceType, function(error, ServiceRequest) { 
      if (error) {
        console.log(error);
        callback(error);
      } else {
        ros.tcpros.callService(parsedUrl.port, parsedUrl.hostname, serviceName,
                               new ServiceRequest(values), callback);
      }
    });
  });
}
