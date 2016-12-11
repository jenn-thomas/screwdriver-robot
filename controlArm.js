// robot variables
var l1 = 35;
var l2 = 2;
var l3 = 22;
var l4 = 22;
var l5 = 14;
var x = 0; 
var y = 20; 
var z = 20;
// ip of robot
var ip = "172.16.98.84";

// set up webserver
var express = require('express');
var app = express();
app.use('/', express.static(__dirname + '/'));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var net = require('net');

//app.use('/', express.static(__dirname + '/'));


app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html'); 
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});

io.on('connection', function(socket){
    socket.emit('sendPts',getValues(x,y,z))
    socket.on('data',getPoints);
    function getPoints(data){
        openConnection(0, data, socket);
    }
});


function openConnection(i, data, socket){
    console.log(data)
    x = data[0]; y = data[1]; z = data[2] + l5; 
    theta5 = data[3]; gripper = data[4];
    var values = getValues(x,y,z);
//    var thetas = [values[0][0][1],values[0][1][1],values[0][2][1],values[0][3][1]]
    var thetaString = values[0][0][1].toString() + ',' +
            values[0][1][1].toString() + ',' +
            values[0][2][1].toString() + ',' +
            values[0][3][1].toString() + ',' +
            theta5.toString() + ',' + gripper.toString();
    var client = net.connect({port: 5002, host:ip});
    console.log('Connected');
//    socket.emit('sendPts',values);
    client.write(thetaString + '\r\n');
    console.log('Thetas sent: ' + thetaString)

    client.on('data', function(angles) {
	   console.log('Received: ' + angles);
//       angles = '' + angles;
//       array = angles.split('\r\n')[0].split(',');
//        for (var j=0; j < array.length; j++){
//            array[j] = Number(array[j]);
//        }
//        var boolean = equalArrays(array,thetas);
//        if (boolean){
            client.destroy();
//            if (i < data.length - 1){
//                i++ 
//                setTimeout(function() {
//                    console.log('angles match')
//                    openConnection(i, data, socket);
//                }, 50)
//                return;
//            } 
//            else {
                console.log('done')
            setTimeout(function() {
                socket.emit('sendPts',values);
            }, 4000)
//                socket.emit('endDrawing','done');
                return;
//            }
//        }
//        else {
//            if (i ==0){
//                client.destroy();
//                setTimeout(function() {
//                console.log("angles don't match")
//                openConnection(i, data, socket);
//            }, 7000)
//                }
//            else{
//                client.destroy();
//                setTimeout(function() {
//                console.log("angles don't match")
//                openConnection(i, data, socket);
//            }, 1000)
//            }
//        }
    })
    client.on('close', function() {
        console.log('Connection closed');
    });   
}

function equalArrays(arr1,arr2){
        for(var i = 0; i< arr1.length;i++) {
            if(Math.abs(arr1[i] - arr2[i]) > 100) {
                return false;
            }
        }
        return true;
}

function getValues(x,y,z){
    var thetas = calcValues(x,y,z);
    var points = getPoints(thetas[0][0],thetas[1][0],thetas[2][0],thetas[3][0])
    return [thetas,points]
}

function calcValues(x, y, z){
    var pi=Math.PI;
//takes in a (x,y) for pen location, returns 4 robot angles in an array
    var theta1 = Math.atan2(y,x);
    var theta1deg = theta1*180/pi - 90;
    var r = Math.sqrt(Math.pow(x-l2*Math.sin(theta1),2)+Math.pow(y-l2*Math.cos(theta1),2)); 
    var m = Math.sqrt(Math.pow(r,2)+Math.pow(l1-z,2));
    var cosBeta = (Math.pow(m,2)+Math.pow(l3,2)-Math.pow(l4,2))/(2*m*l3);
    var cosPiMinus = (Math.pow(l3,2)+Math.pow(l4,2)-Math.pow(m,2))/(2*l3*l4);
    var alpha = Math.atan2(l1-z,r);
    var beta = Math.atan2(-1*Math.sqrt(1-Math.pow(cosBeta,2)),cosBeta);
    var theta2 = (beta + alpha);
    var theta2deg = isNaN(theta2) ? 0 : theta2*180/pi;
    var theta3 = pi - Math.atan2(Math.sqrt(1-Math.pow(cosPiMinus,2)),cosPiMinus);
    var theta3deg = isNaN(theta3) ? 0 : theta3*180/pi;
    var theta4 = pi/2 - (theta2+theta3);
    var theta4deg = isNaN(theta4) ? 0 : theta4*180/pi;
    var angles=new Array(4);
    angles[0]=[theta1,theta1deg];
    angles[1]=[theta2,theta2deg];
    angles[2]=[theta3,theta3deg];
    angles[3]=[theta4,theta4deg];
//    console.log(angles)
    return angles;
}

function getPoints(th1,th2,th3,th4){
//based on the robot arm angles, returns joint locations in x,y,z
    //origin
    var pi=Math.PI;
    var x0 = 0; var y0 = 0; var z0 = 0;
    //pt1
    var x1 = x0; var y1 = y0; var z1 = l1;
    //pt2
    var x2 = l2*Math.cos(th1); var y2 = l2*Math.sin(th1); var z2 = l1;
    //pt3
    var x3 = l3*Math.sin(pi/2-th2)*Math.cos(th1)+x2; 
    var y3 = l3*Math.sin(pi/2-th2)*Math.sin(th1)+y2; 
    var z3 = l1 - l3*Math.sin(th2);
    //pt4
    var x4 = x; var y4 = y; var z4 = z;
    //pt5
    var x5 = x4; var y5 = y4; var z5 = z4-l5;
    var xPoints = [x0, x1, x2, x3, x4, x5];
    var yPoints = [y0, y1, y2, y3, y4, y5];
    var zPoints = [z0, z1, z2, z3, z4, z5];
    return [xPoints,yPoints,zPoints];
}






