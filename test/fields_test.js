var should   = require('should')
  , fields   = require('../lib/fields')
  , messages = require('../lib/messages')
  ;

describe('Fields', function() {

  describe('types', function() {

    it('should identify primitives', function() {
      fields.isPrimitive('bool').should.be.true;
      fields.isPrimitive('int8').should.be.true;
      fields.isPrimitive('uint8').should.be.true;
      fields.isPrimitive('int16').should.be.true;
      fields.isPrimitive('uint16').should.be.true;
      fields.isPrimitive('int32').should.be.true;
      fields.isPrimitive('uint32').should.be.true;
      fields.isPrimitive('float32').should.be.true;
      fields.isPrimitive('float64').should.be.true;
      fields.isPrimitive('string').should.be.true;

      fields.isPrimitive('bool[]').should.be.false;
      fields.isPrimitive('float32[]').should.be.false;
      fields.isPrimitive('float64[]').should.be.false;
      fields.isPrimitive('float64[36]').should.be.false;
      fields.isPrimitive('std_msgs/String[]').should.be.false;

      fields.isPrimitive('std_msgs/String').should.be.false;
      fields.isPrimitive('Header').should.be.false;
      fields.isPrimitive('geometry_msgs/Twist').should.be.false;
      fields.isPrimitive('Point32').should.be.false;
      fields.isPrimitive('String').should.be.false;
    });

    it('should identify arrays', function() {
      fields.isArray('bool[]').should.be.true;
      fields.isArray('int8[]').should.be.true;
      fields.isArray('float32[]').should.be.true;
      fields.isArray('float64[36]').should.be.true;
      fields.isArray('std_msgs/String[]').should.be.true;
      fields.isArray('geometry_msgs/Twist[]').should.be.true;
      fields.isArray('Point32[]').should.be.true;

      fields.isArray('bool').should.be.false;
      fields.isArray('float32').should.be.false;
      fields.isArray('std_msgs/String').should.be.false
      fields.isArray('Header').should.be.false
      fields.isArray('Point32').should.be.false
    });

    it('should identify messages', function() {
      fields.isMessage('std_msgs/String').should.be.true;
      fields.isMessage('geometry_msgs/String').should.be.true;
      fields.isMessage('String').should.be.true;
      fields.isMessage('Header').should.be.true;
      fields.isMessage('Point32').should.be.true;

      fields.isMessage('bool').should.be.false;
      fields.isMessage('float32').should.be.false;
      fields.isMessage('string').should.be.false;
      fields.isMessage('bool[]').should.be.false;
      fields.isMessage('float32[]').should.be.false;
      fields.isMessage('float64[36]').should.be.false;
      fields.isMessage('std_msgs/String[]').should.be.false;
      fields.isMessage('Point32[]').should.be.false;
    });

    it('should get type of array', function() {
      fields.getTypeOfArray('float32[]').should.be.equal('float32');
      fields.getTypeOfArray('std_msgs/String[48]').should.be.equal('std_msgs/String');
      fields.getTypeOfArray('std_msgs/String').should.be.false;
    });

  });

  describe('sizes', function() {

    it('should get correct size for primitives', function() {
      fields.getPrimitiveSize('char', 'a').should.be.equal(1);
      fields.getPrimitiveSize('byte', 1).should.be.equal(1);
      fields.getPrimitiveSize('bool', true).should.be.equal(1);
      fields.getPrimitiveSize('int8', -1).should.be.equal(1);
      fields.getPrimitiveSize('uint8', 1).should.be.equal(1);
      fields.getPrimitiveSize('int16', -1).should.be.equal(2);
      fields.getPrimitiveSize('uint16', 1).should.be.equal(2);
      fields.getPrimitiveSize('int32', -1).should.be.equal(4);
      fields.getPrimitiveSize('uint32', 1).should.be.equal(4);
      fields.getPrimitiveSize('int64', -1).should.be.equal(8);
      fields.getPrimitiveSize('uint64', 1).should.be.equal(8);
      fields.getPrimitiveSize('float32', -1.1).should.be.equal(4);
      fields.getPrimitiveSize('float64', 1.1).should.be.equal(8);
      fields.getPrimitiveSize('string', 'hello').should.be.equal(4 + 5);
    });

    it('should get correct sizes for arrays', function() {
      var stringArray = ['hello', 'world'];
      var stringArrayLength = 4 + (4 + 5) + (4 + 5);
      fields.getArraySize('string[]', stringArray).should.be.equal(stringArrayLength);

      var int32Array = [1, 2, 3];
      var int32ArrayLength = 4 + (int32Array.length * 4);
      fields.getArraySize('int32[]', int32Array).should.be.equal(int32ArrayLength);
    });

    it('should get correct size for messages', function(done) {
      messages.getMessage('std_msgs/String', function(error, String) {
        var string = new String({ data: 'hello' });
        fields.getMessageSize(string).should.be.equal(4 + 5);
        done();
      });
    });

  });

  describe('parsing', function() {

    it('should parse primitives', function() {
      fields.parsePrimitive('char', '2').should.be.equal(2);
      fields.parsePrimitive('byte', '1').should.be.equal(1);
      fields.parsePrimitive('bool', '1').should.be.equal(true);
      fields.parsePrimitive('bool', '0').should.be.equal(false);
      fields.parsePrimitive('int8', '-1').should.be.equal(-1);
      fields.parsePrimitive('uint8', '7').should.be.equal(7);
      fields.parsePrimitive('int16', '-12').should.be.equal(-12);
      fields.parsePrimitive('uint16', '31').should.be.equal(31);
      fields.parsePrimitive('int32', '-1234').should.be.equal(-1234);
      fields.parsePrimitive('uint32', '7561').should.be.equal(7561);
      fields.parsePrimitive('float32', '-1.1').should.be.equal(-1.1);
      fields.parsePrimitive('float64', '1.1').should.be.equal(1.1);
      fields.parsePrimitive('string', 'hello').should.be.equal('hello');
    });

  });

});

