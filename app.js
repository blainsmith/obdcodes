
/**
 * Module dependencies.
 */

var _ = require('underscore');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var codes = require('./codes.json');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/1/:code/:make', function(req, res) {
  var code = req.params.code;
  var make = req.params.make;
  
  var theCode = {};
  theCode.obdVersion = '1';
  theCode.platform = make;

  var foundCode = _.findWhere(codes['1'][make], { code: code });

  if(foundCode){
    theCode = _.extend(theCode, foundCode);
    res.json(theCode);
  } else {
    res.send(404, 'Code not found.');
  }
});

app.get('/2/:code', function(req, res) {
  var code = req.params.code.toUpperCase();
  var codePrefix = code.substr(0, 2);

  if(codePrefix !== 'P1') {
    var theCode = {};
    theCode.obdVersion = '2';
    theCode.platform = 'generic';

    var foundCode = _.findWhere(codes['2']['generic'], { code: code });

    if(foundCode) {
      theCode = _.extend(theCode, foundCode);
      res.json(theCode);
    } else {
      res.send(404, 'Generic code not found.')
    }
  } else {
    res.send(400, 'You specified a manufacturer specific code without a make.');
  }
});

app.get('/2/:code/:make', function(req, res) {
  var code = req.params.code.toUpperCase();
  var make = req.params.make;
  var codePrefix = code.substr(0, 2);

  if(codePrefix == 'P1') {
    var theCode = {};
    theCode.obdVersion = '2';
    theCode.platform = make;

    var foundCode = _.findWhere(codes['2'][make], { code: code });

    if(foundCode) {
      theCode = _.extend(theCode, foundCode);
      res.json(theCode);
    } else {
      res.send(404, 'Manufacturer specific code not found. Perhaps you need to specify a different make.')
    }
  } else {
    res.send(400, 'You specified a generic code along with a make.');
  }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
