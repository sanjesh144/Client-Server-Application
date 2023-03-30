
// Some code need to be added here, that are common for the 
let sequenceNumber; // declaring variable named sequenceNumber
let timerInterval = 10; // declare variable named timerInterval and assigning it a value of 10 
let timer;

// When this module is called upon everything within "module.exports" will be available 
module.exports = {

     /*
    This function will be used to create a "new object"
    This function has no inputs
     */
    init: function() {
       timer = Math.floor(1000*Math.random()); // sets value of a random number between 0 and 999. Rounded down using the floor function
       setInterval(timerFunc, timerInterval); // calls setInterval method, which will repeatedly execute timerFunc method
       sequenceNumber = Math.floor(1000 * Math.random());  // sets value of a random number between 0 and 999. Rounded down using the floor function
    },

    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    /*
    defines method with no inputs parameters. 
    Used to retireve the current sequence number and increment by 1
    */
    getSequenceNumber: function() {
        sequenceNumber++; // increment
        return sequenceNumber; // return incremented sequence number
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function() {
        return timer; // returning time
    }


};

/*
defining function with no input parameters and has no return value
increments timer by and checks if variable is equal to maximum value for a 32-bit unigned int
If it is equal, reset to a random integer between 0 and 999 rounded down using floor function
*/
function timerFunc(){
        timer++; // increment timer

        // checks if timer is equal to maximum value for a 32-bit unisigned integer
        if(timer == 4294967295){
            timer = Math.floor(1000 * Math.random()); // random number between 0 and 999 rounded down
        }
    }