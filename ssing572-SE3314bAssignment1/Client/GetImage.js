let net = require("net"); // This is a netwroking API
let fileSystem = require("fs"); //This is a file system library
let open = require("open");
let ITPpacket = require("./ITPRequest"); 
let singleton = require("./Singleton");


// Below is code to get the commandline arguments passed in
let sOption = process.argv[2]; // This gets the "-s" option from the command

let serverIPandPort = process.argv[3].split(":"); // This gets both the host server IP address and port number and puts it into an array

let qOption = process.argv[4]; // This gets the q option from the command line

let imgName = process.argv[5]; // This gets the image name from the command line

let vOption = process.argv[6]; // This gets the "-v" option from the command line

let ITPVer = process.argv[7]; // This gets the ITP version from the command line




singleton.init(); // instantiating singleton
ITPpacket.init(ITPVer, imgName, singleton.getTimestamp()); // instantiating ITPpacket, which is the ITPRequest file

let client = new net.Socket(); // This uses the a networking API

// Below is setting up the IP address and port number 
client.connect(serverIPandPort[1], serverIPandPort[0], function(){ 
  console.log("Connected to ImageDB server on: " + serverIPandPort[0] + ":" + serverIPandPort[1]);
  client.write(ITPpacket.getBytePacket());
});

// This is an array that stores the image extensions 
let imgExtenstion = {
  1: "BMP",
  2: "JPEG",
  3: "GIF",
  4: "PNG",
  5: "TIFF",
  6: "RAW",
};

// This is the responses the program can give
let responseName = {
  0: "Query",
  1: "Found",
  2: "Not found",
  3: "Busy",
};

const pieces = []; // This stores the chunks of data

// event listener for "data" 
client.on("data", (piece) => {
  pieces.push(piece) // pushing the piece of data into peices
});

// event listener for "pause", then display message
client.on("pause", () =>{
  console.log("pause"); // The message to be displayed
});

// event listener for "end", put all the pieces of data in an buffer and slice to get the header and the load
client.on("end", () =>{
  const responsePacket = Buffer.concat(pieces); // storing pieces of data in buffer and assigning a name
  let header = responsePacket.slice(0, 12); // slicing to get header
  let pLoad = responsePacket.slice(12); // slicing to get the load

  console.log("\nITP packet header receieved:"); // printing a message
  printPacketBit(header);

  let imgDataSize = pLoad.length; 

  // This creates a new file if the specified file does not exist 
  fileSystem.writeFileSync(imgName, pLoad);

  (async () => {
    await open(imgName, {wait : true}); // opening file
    process.exit(1);
  })();

  // Below is the set up for the output
  console.log("\nServer sent:"); // inital message
  console.log("   ---ITP version = " + parseBitPacket(header, 0 ,4)); // This gets the ITP version from the header and displys it 
  console.log("   ---Response Type = " + responseName[parseBitPacket(header, 4, 8)]); // This gets the response type from the header and find the corresponding "responseName" and displays it
  console.log("   ---Sequence Number = " + parseBitPacket(header, 12, 16)); // This gets the sequence number from the header and displays it
  console.log("   ---Timestamp = " + parseBitPacket(header, 32, 32)); // This gets the time stamp and displays it
  client.end()
});

// event listener for "close", close then dislpay message
client.on("close", function(){ 
  console.log("Connection closed"); // This is the message to be displayed
});

// When the program is ending display message
client.on("end", () => {
  console.log("Disconnected from the server"); // The message go be displayed
});





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


  
