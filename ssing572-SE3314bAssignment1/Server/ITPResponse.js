
// You may need to add some delectation here

var HEADER_SIZE = 12; // This is a constant. This represents the size of the ITP header in bytes 

var version, response, sequence, time; // declare variables


// below is what will export along with three properties
module.exports = {
    rHeader: "",
    pLoadSize: 0,
    pLoad: "",


    /*
    defines a function called init and five input parameters 
    Inputs are the version, response type, sequence number, current time and image data
    */
    init: function (ver, responseType, sequenceNumber, currTime, imgData) { // feel free to add function parameters as needed
        

        this.rHeader = new Buffer.alloc(HEADER_SIZE); // create new buffer and assign it to rHeader property with the size of HEADER_SIZE

        storeBitPacket(this.rHeader, ver, 0, 4); // storing the version in specific location of header
        storeBitPacket(this.rHeader, responseType, 4, 8); // storing the response type in specific location of header
        storeBitPacket(this.rHeader, sequenceNumber, 12, 16); // storing the sequence number in specific location of header
        storeBitPacket(this.rHeader, currTime, 32, 32); // storing the surrent time in specific location of header
        storeBitPacket(this.rHeader, imgData.length, 64, 64); // storing the image data inspecific location of header


        /*
        created new buffer object and assign to pLoad. 
        The length of the buffer is the length of imgData + 4
        */
        this.pLoad = new Buffer.alloc(imgData.length + 4);

        // iterates over the imgData and assigns element to the corresponding index of pLoad
        for(i = 0; i < imgData.length; i++){
            this.pLoad[i] = imgData[i];
        }
    },

    //--------------------------
    //getpacket: returns the entire packet
    //--------------------------
    // defining method
    getPacket: function () {
        let pkt = new Buffer.alloc(this.pLoad + HEADER_SIZE); // create new buffer object with a length of pLoad + HEADER_SIZE

        // copies contents of rHeader into the first HEADER_SIZE bytes of pkt
        for(var i = 0; i < HEADER_SIZE; i++){
            pkt[i] = this.rHeader[i];
        }

        // copies contents of pLoad into remaining bytes of pkt 
        for(var j = 0; j < this.pLoad.length; i++){
            pkt[j + HEADER_SIZE] = this.pLoad[j];
        }
        return pkt; // returning buffer
    },

    // declaring function with no input parameters 
    getBytePacket: function () {
    let pkt = new Buffer.alloc(this.pLoad.length + HEADER_SIZE); // creates new buffer named pky with size of the length of pLoad + the HEADER_SIZE


    /*
    copies contents rHeader into the first HEADER_SIZE bytes of pkt
    Done by iterating indicies 0 - HEADER_SIZE -1
    */
    for(var h = 0; h < HEADER_SIZE; h++){
      pkt[h] = this.rHeader[h];
    }

    /*
    Copies contents of pLoad into the remaining bytes of pkt
    Done by iterating over indicies 0 - pLoad.length - 1
    */
    for(var p = 0; p < this.pLoad.length; p++){
      pkt[p + HEADER_SIZE] = this.pLoad[p];
    }
    return pkt; // returning buffer
  },

  

};

//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

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


