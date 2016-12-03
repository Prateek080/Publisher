"use strict"

var fs = require('fs');
var q = require('q');
var http = require('http');
var server = http.createServer()
var socket = require('socket.io').listen(server);
var number = 1;
var notCalled = true;
var lines = [];
var totallines = 0;

function getData() {
    var defer = q.defer();
    fs.readFile(__dirname + '/filllist.txt', function(err, data) {
        if (err) {
            defer.reject('Error : -' + number);
            return;
        }
        if (notCalled) {
            lines = data.toString('utf-8').split("\n");
            totallines = lines.length;
            notCalled = false;
        }
        if (number >= totallines) {
            return defer.reject(err);
        }
        defer.resolve(lines[number]);
    });
    return defer.promise;
}

function printData() {
    var promise = getData();
    promise.then(function(data) {
        console.log(data);
        number = number + 1;
        socket.emit('broad', data);
        setTimeout(printData, 1000);
    }, function(err) {
        number = 1;
    });
}


socket.on('connection', function(socket) {
    console.log('socket');
});

server.listen(3000, function() {
    console.log('Listening at: http://localhost:3000');
    setTimeout(function() {
        printData()
    }, 3000)

});
