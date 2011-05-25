var util       = require('util')
  , events     = require('events')
  , Publisher  = require('./publisher')
  , Subscriber = require('./subscriber')

var publications  = []
var subscriptions = []

function Node(name) {
  if (false === (this instanceof Node)) {
    return new Node(name);
  }

  this.name = name

  // Events handled
  events.EventEmitter.call(this);
  this.on('published', function(topic) {
    publications.push(topic)
    console.log('PUBLISHED: ' + publications)
  })

  this.on('subscribed', function(topic) {
    subscriptions.push(topic)
    console.log('SUBSCRIBED: ' + subscriptions)
  })
}
util.inherits(Node, events.EventEmitter)

Node.prototype.createPublisher = function() {
  return new Publisher(this)
}

Node.prototype.createSubscriber = function() {
  return new Subscriber(this)
}

module.exports = Node
