// You may need to add some delectation here

let HEADER_SIZE = 12; // This reserves space for the response header

let version, requestType, currTime; // Variables to store the version, request type and current time


/*
When this file is exported to "GetImage.js" everything within this 
file will be available in "GetImage.js"
*/
module.exports = {
  header: "", // defining a property called header with inital value of empty string
  pLoadSize: 0, // property for pay-load size with an inital value of 0 
  pLoad: "", // property for the pay-load with empty string inital value


  /*
  This function will be used to create a "new object"
  This has 3 inputs of the version, full image name and time stamp
  */
  init: function (ver, fullImgName, tStamp) {
    requestType = 0; // assigning value of 0 to a varibale called request Type

    // creating a new buffer objext with size of HEADER_SIZE assigned to a property called header
    this.header = new Buffer.alloc(HEADER_SIZE);

    storeBitPacket(this.header, ver * 1, 0, 4); // getting the version from the header
    storeBitPacket(this.header, requestType, 24, 8); // getting the request type from the header
    storeBitPacket(this.header, tStamp, 32, 32); // getting the time stamp from the header

    /*
    Declaring variable for the image extensions and assigning an object to it
    The object will contain properties that represent different image file extensions
    */
    let imgExtension = {
      BMP: 1,
      JPEG: 2,
      GIF: 3,
      PNG: 4,
      TIFF: 5,
      RAW: 15,
    };

    imgName = stringToBytes(fullImgName.split(".")[0]); // converting image name to bytes
    imgType = imgExtension[fullImgName.split(".")[1].toUpperCase()]; // getting the image extenion

    storeBitPacket(this.header, imgType, 64, 4); // putting the image type in specfifc position in header
    storeBitPacket(this.header, imgName.length, 68, 28); // putting the image name in specific position in header

    this.pLoadSize = imgName.length; // the pay-load size is equal to the length of "imgName"
    this.pLoad = new Buffer.alloc(this.pLoadSize); // new biffer object fot the pay-load and allocating memory

    // itterates each character in "imgName" and assigns it to the corresponding index in the pay-load buffer
    for(i = 0; i < imgName.length; i++){
      this.pLoad[i] = imgName[i]
    }
  },


  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------

  // defining method 
  getBytePacket: function () {

    // creates a new buffer object with size equals to the pay-load length plus the HEADER_SIZE
    // The Buffer.alloc method is used to allocate memory to the buffer
    let pkt = new Buffer.alloc(this.pLoad.length + HEADER_SIZE);

    // itterates over the HEADER_SIZE, setting each indec pf pkt to the corresponding value from the header propery 
    for(var h = 0; h < HEADER_SIZE; h++){
      pkt[h] = this.header[h];
    }

    // itterates over the length of pay-load, setting each index of pkt to the corrsponding value from pLoad
    for(var p = 0; p < this.pLoad.length; p++){
      pkt[p + HEADER_SIZE] = this.pLoad[p]; // The index is offset of HEADER_SIZE
    }
    return pkt; // returning pkt buffer object
  },


};


//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

// Convert a given string to byte array
function stringToBytes(str) {
  var ch,
    st,
    re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xff); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

// Store integer value into specific bit poistion the packet
function storeBitPacket(packet, value, offset, length) {
  // let us get the actual byte position of the offset
  let lastBitPosition = offset + length - 1;
  let number = value.toString(2);
  let j = number.length - 1;
  for (var i = 0; i < number.length; i++) {
    let bytePosition = Math.floor(lastBitPosition / 8);
    let bitPosition = 7 - (lastBitPosition % 8);
    if (number.charAt(j--) == "0") {
      packet[bytePosition] &= ~(1 << bitPosition);
    } else {
      packet[bytePosition] |= 1 << bitPosition;
    }
    lastBitPosition--;
  }
}
