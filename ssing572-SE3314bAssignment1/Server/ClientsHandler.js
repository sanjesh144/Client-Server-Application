let ITPpacket = require('./ITPResponse');
let singleton = require('./Singleton');

// You may need to add some delectation here

const fs = require("fs"); // imports the built-in Node.js fs module, provides an API for working with the file system


/*
declaring three variables and initalizes each of them as an empty object
the {} notation is used to create an empty object literal 
*/
var names = {}, clientIP = {}, startTStamp = {};


// exports an object with a single method to be used by other parts of the application
module.exports = {

    // defines method that has one input parameter
    handleClientJoining: function (socket) {
        assignClientName(socket, names); //calling fucntion
        const chunks = []; // creating an empty array

        // printing message
        console.log( "\n" + names[socket.id] + " is connected at timestamp " + startTStamp[socket.id]);

        // sets up an event listener for the "data" event
        socket.on("data", function(requestPacket){
            handleClientRequests(requestPacket, socket); // calling function
        });

        // setting up event listener for the "close" event 
        socket.on("close", function() {
            handleClientLeaving(socket); // calling function 
        });
    }
};



/*
Declaring a function with two input parameters: data and scoket

*/
function handleClientRequests(data, socket){
    console.log("\nIPT packet received:"); // logs to console packet was recieved
    printPacketBit(data); // priting

    let version = parseBitPacket(data, 0, 4); // extracting the first four bits
    let requestType = parseBitPacket(data, 24, 8); // extracts 8 bits starting at 24th bit

    // creating object for request type with four properties 
    let requestName = {
        0: "Query",
        1: "Found",
        2: "Not found",
        3: "Busy",
    };

    // creating object with six properties, each corresponding to a possible image type
    let imgExtension = {
        1: "BMP",
        2: "JPEG",
        3: "GIF",
        4: "PNG",
        5: "TIFF",
        15: "RAW",
    };

    let tStamp = parseBitPacket(data, 32, 32); // getting the time stamp
    let imgType = parseBitPacket(data, 64, 4); // getting the image type
    let imgTypeName = imgExtension[imgType]; // retrieving corresponding image type 
    let imgNameSize = parseBitPacket(data, 68, 28); // extrcating 28 bits and assigning them to a varibale called imgNameSize
    let imgName = bytesToString(data.slice(12, 13 + imgNameSize));


    // logging to the console information about the ITP packet
    console.log("\n" + names[socket.id] + " requests:" + "\n   --ITP version: " + version + "\n   --Timestamp: " + tStamp + "\n   --Request type: " + requestName[requestType] + "\n   --Image file extension(s): " + imgTypeName + "\n   --Image file name: " + imgName + "\n");

    // checking if the version is 7
    if(version == 7){
        let imgFullName = "images/" + imgName + "." + imgTypeName; // putting all the image info in one variable
        let imgData = fs.readFileSync(imgFullName); // reads the contents of imgFullName and assinging it to imgData

        // calling the init function of ITPpacket, this has 5 input parameters
        ITPpacket.init(
            version, 1, singleton.getSequenceNumber(), singleton.getTimestamp(), imgData,
        );

        socket.write(ITPpacket.getBytePacket()); // writing binary data of packet to socket
        socket.end(); // ends the connection
    }
    // If the version is not 7, display error 
    else{
        console.log("The protocol version is not supported");
        socket.end();
    }
}

// function to close connection
function handleClientLeaving(socket){
    console.log(names[socket.id] + " closed the connection"); // message to display
}

// declaring function with 2 input parameters 
function assignClientName(socket, names){
    socket.id = socket.remoteAddress + ":" + socket.remotePort; // setting up unique identifier for address and port number
    startTStamp[socket.id] = singleton.getTimestamp(); // assigning the time stamp
    var name = "Client-" + startTStamp[socket.id]; 
    names[socket.id] = name; // at index of socket.id assign name
    clientIP[socket.id] = socket.remoteAddress;
}



//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

// Returns the integer value of the extracted bits fragment for a given packet
function parseBitPacket(packet, offset, length) {
    let number = "";
    for (var i = 0; i < length; i++) {
        // let us get the actual byte position of the offset
        let bytePosition = Math.floor((offset + i) / 8);
        let bitPosition = 7 - ((offset + i) % 8);
        let bit = (packet[bytePosition] >> bitPosition) % 2;
        number = (number << 1) | bit;
    }
    return number;
}

// Prints the entire packet in bits format
function printPacketBit(packet) {
    var bitString = "";

    for (var i = 0; i < packet.length; i++) {
        // To add leading zeros
        var b = "00000000" + packet[i].toString(2);
        // To print 4 bytes per line
        if (i > 0 && i % 4 == 0) bitString += "\n";
        bitString += " " + b.substr(b.length - 8);
    }
    console.log(bitString);
}

// Converts byte array to string
function bytesToString(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}