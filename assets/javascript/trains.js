//@ts-check

baseDate = moment().format("YYYY-MM-DD");
let firstTime = 0; //used as means to immediately populate the table 
                   //when the screen is first displayed instead of 
                   //waiting the first minute for the setInterval delay
let noEntry = 1; //prevents the initial on("child_added") from running
let trainData = {};
let errorCheck = 0;
let now;  //monitors the current time based on the computer's clock
let rowNoTrain = 0; //keeps track of the last train row number
let rowNoMins = 0;
let intvlDelay = 1000; //the train schedule is updated every minute but when 
                       //the program is first initiated it could occur at any 
                       //time so there will always be some constant offset between
                       //the system time and the displayed time (eg initiated at 
                       //06:01:45 system time will always have the display 
                       //updated 45 seconds after the system time). So this initial
                       //interval time is set to 1000 milliseconds so the time display
                       //updates every second until the time reaches xx:yy:00, then the
                       //displayed and system clock will be synchronised and the intvlDelay
                       //will be changed to 60000 milliseconds

  // Your web app's Firebase configuration
let firebaseConfig = {
    apiKey: "AIzaSyBuYEqmmv30O-IIBEbaO3UTBRSoBAvn8ao",
    authDomain: "trainschedule-bd717.firebaseapp.com",
    databaseURL: "https://trainschedule-bd717.firebaseio.com",
    projectId: "trainschedule-bd717",
    storageBucket: "trainschedule-bd717.appspot.com",
    messagingSenderId: "21166858502",
    appId: "1:21166858502:web:b6183d5ac7bdfc8ab33e87"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let database = firebase.database();

//listen for firebase value events and add the data to the webpage
//database.ref().on("value", function(snapshot) { //this works but may not need to do it for every change to the database
//listen for firebase child_added events the resulting snapshot only yields the added child
//this is triggered when a new station is added to the database
//from Stack Overflow https://stackoverflow.com/questions/11788902/firebase-child-added-only-get-child-added


//this event listens for the addition of the next train to the database
//it updates the train schedule with only the details of that new train
//entry
database.ref().orderByKey().limitToLast(1).on("child_added", function(snapshot) {
    if (!noEntry) {  //noEntry === 1 prevents this from running, child_added listener 
                     //triggers once immediately and then every time a child is added
                     //this is to prevent the below from happening in the first instance
        noEntry = 0;
        populateTrain(snapshot, "later");
    }
})

//clears the train entry form ready for the next entry
function clearForm() {
    $("#train-input").val("");
    $("#dest").val("");
    $("#start-time").val("");
    $("#freq").val("");
}

//the validated data is pushed into the firebase database
function loadFormData() {
    //load validated data into the firebase database
    
    database.ref().push({
        trainname: trainData.trainName,
        destination: trainData.dest,
        starttime: trainData.startTime,
        frequency: trainData.freq,
        // currenttime: now
    });
    noEntry = 0; //needed to allow the update procedure to run
}

//extracts the data from the input form and presents it in a modal for
//user confirmation of the data entered
function assignEntries() {
    //extract the data from the form into an object variable
    trainData.trainName = $("#train-input").val().trim();
    trainData.dest = $("#dest").val().trim();
    trainData.startTime = $("#start-time").val().trim();
    trainData.freq = $("#freq").val().trim();
    //set up modal message for confirming the entered data
    let confirmMsg = "Are you happy with the data entered and ready to commit to the database?\n" + 
                     "\nTrain Name: " + trainData.trainName +
                     "\nDestination: " + trainData.dest +
                     "\nStart Time: " + trainData.startTime +
                     "\nFrequency: " + trainData.freq;
    $("#modal-msg").text(confirmMsg);
    $("#modal-confirmentry").modal("show"); //display the modal with the entered data for confirmation
}

//checks for valid text entries, time in 24 hour format and a number entry for train frequency
function validateEntries() {
    let modalErrors = "";
    //check text entries for train name and destination
    let textCheck = [$("#train-input").val().trim(), $("#dest").val().trim()];
    $.each(textCheck, function(i, textIn) {
        if (textIn === "" && i === 0) {
            modalErrors = "\t\t- Train Name - re-enter a valid train name.\n";
            errorCheck += 1;
        }
        else if (textIn ==="" && i === 1) {
            modalErrors = modalErrors + "\t\t- Destination - re-enter a valid destination.\n"
            errorCheck += 1;
        }
    })

    //check time supplied is in 24 hour format
    let timeCheck = $("#start-time").val().trim();
    //regular expression to validate 24 hour format entry for start time
    let regex = /(?:[01]\d|2[0123]):(?:[012345]\d)/;
    if (!timeCheck.match(regex)) {
        modalErrors = modalErrors + "\t\t- First train time - in 24 hour " +
            "format (hh:mm) - re-enter a valid time.\n";
        errorCheck += 1;
    }

    //check train frequency is a number, integer and between 5 and 180 minutes
    let freqCheck = Number($("#freq").val().trim());
    // if(isNaN(freqCheck) || !Number.isInteger(freqCheck) || freqCheck > 180 || freqCheck < 5) {
    if(isNaN(freqCheck) || !Number.isInteger((freqCheck)) || freqCheck > 180 || freqCheck < 5) {
        modalErrors = modalErrors + "\t\t- Train frequency - in whole minutes between 5 and 180 " +
            "minutes - \tre-enter a valid frequency.\n";
        errorCheck += 1;
    }
    if (errorCheck > 0) {
        $("#modal-message").text("You have not entered valid entries for the " + 
            "following:\n" + modalErrors);
        $("#modal-validate").modal("show");
    }
}

//button listener
$(document).on("click", "#submit-button, #confirm-button", function(event) {
    event.preventDefault();
    //user entry form button pressed
    if ($(this).attr("id") === "submit-button") {
        validateEntries();
        if (errorCheck === 0) {
            assignEntries();
        }
        errorCheck = 0;
    }
    //user check modal button pressed
    else if ($(this).attr("id") === "confirm-button") {
        $("#modal-confirmentry").modal("hide");
        loadFormData();
        clearForm();
    }
})

//update the fourth and fifth columns containing the Next Arrival and Minutes Away columns
function updateMinsDisp(trainSched) {
    let trainOrder = ["nexttrain", "minutes"];
    //get rid of the existing next arrival and minutes away columns for each row in turn if it currently exists
    let cellIdents = "tr[id='row" + rowNoMins + "'] td:nth-child(4), tr[id='row" + 
        rowNoMins + "'] td:nth-child(5)";
    if ($(cellIdents).length) { //if this variable has a length then it exists so remove it
        $(cellIdents).remove();
    }
    //populate or repopulate the next arrival and minutes away columns for each row in turn
    trainOrder.forEach(function (value, index) {
        let trainInfo = $("<td>");  
        trainInfo.text(trainSched[value]);
        $("#row" + rowNoMins).append(trainInfo);
    })
}

//calculate the next train time and how many minutes away it is 
function calculateMins(child, trainTime) {
    let trainSched = child.val();
    trainTime.startTime = moment(baseDate + " " + trainSched.starttime);
    trainTime.currentTime = moment(baseDate + " " + now);
    trainTime.freq = parseInt(trainSched.frequency);
    trainTime.diffNowStart = trainTime.currentTime.diff(trainTime.startTime, "minutes");
    trainTime.ratio = trainTime.diffNowStart / trainTime.freq;
    //3 scenarios
    //- where the current time is before the train starts for the day
    if (trainTime.diffNowStart < 0) {
        trainSched.nexttrain = trainTime.startTime;
        trainSched.minutes = Math.abs(trainTime.diffNowStart);
    }
    //- where the train start time has passed but only the first train has left for the day
    else if (trainTime.ratio < 1) {
        trainSched.nexttrain = moment(trainTime.startTime).add(trainTime.freq, "minutes");
        trainSched.minutes = moment(trainSched.nexttrain.diff(trainTime.currentTime)).format("m");
    }
    //- where the train start time has passed and several trains have left for the day
    else {
        trainSched.nexttrain = trainTime.startTime.add(Math.ceil(trainTime.ratio) * trainTime.freq, "minutes");
        trainSched.minutes = moment(trainSched.nexttrain.diff(trainTime.currentTime)).format("m");
    }
    trainSched.nexttrain = trainSched.nexttrain.format("HH:mm");
    updateMinsDisp(trainSched);    
}

//3 scenarios for looping the minutes 2 methods passed from retrieveData (1 minute updates and first update) and the other from
//the insert of a new station
function minsLoop(dbInfo, when) {  //relies on the global trainObj for information
    let trainTime = {};
    //update the times for all trains
    if (when === "first") {
        rowNoMins = 0;
        dbInfo.forEach(function(child) {
            calculateMins(child, trainTime);
            rowNoMins++;
        })
    }
    //update only the time for the train just added
    else {
        calculateMins(dbInfo, trainTime);
        rowNoMins++;
    }       
}

//setInterval function which triggers the update of the clock, next train time 
//and minutes away every minute   
function minuteMon(delay) {
    //setInterval does its first execution only after the required delay
    //meaning the clock, next arrival and minutes will miss for the first minute 
    if (!firstTime) {
        retrieveData();
        firstTime += 1;
    }   
    setInterval(function() {
        retrieveData();
    }, delay);
}

//loop through and populate the train name, detaination and frequency
function loopFBVals(trainObj) {
    //this is the order stored in firebase trainname (position 3), destination (position 0) and frequency (position 1)
    let trainOrder = ["trainname", "destination", "frequency"];
    trainOrder.forEach(function (value, index) {
        let trainInfo = $("<td>");
        trainInfo.text(trainObj[value]);
        $("#row" + rowNoTrain).append(trainInfo);
    })
}

//set up for populating the train name, destination and frequency fields
function populateTrain(dbInfo, when) {
    let trainObj;
    //in the case of the initial set up populate the display with all rows in the database
    if (when === "first") {
        rowNoTrain = 0;
        $("tbody").html("");
        dbInfo.forEach(function(child) {
            $("tbody").append("<tr id=row" + rowNoTrain + ">");
            trainObj = child.val();
            loopFBVals(trainObj);
            rowNoTrain++;
        })    
    }
    //in the case of an addition to the database just populate the display with the last record
    else if (when === "later") {
        trainObj = dbInfo.val();
        $("tbody").append("<tr id=row" + rowNoTrain + ">");
        loopFBVals(trainObj);
        rowNoTrain++;
    }
    minsLoop(dbInfo, when); //this required to populate the next arrival and minutes columns within the first 60s
}

//update the clock display on the stroke of the new minute, occurs only once to synchronise with the system
//clock
function syncDisplay() {
    //this is the point where the system clock has just reached 60s and therefore the display can now be
    //synchronised, the interval can also be changed to monitoring every minute instead of every second
    //this should only execute once to clear the 1s period setInterval, change the delay interval to 60s
    //and run the setInterval routine at 60s
    if (moment().seconds() === 00 && !firstTime) {
        intvlDelay = 60000;
        clearInterval(systemInitDisplay); //clear the setInterval which monitored every 1s DECOMMENT THIS!!!!!
        minuteMon(intvlDelay); //intiate the setInterval which monitors every 60s
    }
    noEntry = 0;
}

//update the train schedule's time display
function updateTime() {
    //if nothing is displayed then display it now instead of waiting for the first 60 seconds to elapse
    now = moment().format("HH:mm");
    if ($("#current-time").text().trim() === "") { 
        database.ref().once("value", function(data) {
            populateTrain(data, "first");
        })
    }
   
    //this is the only part of the procedure that runs each time after the first few iterations required to 
    //synchronise seconds between the system clock and the displayed time
    $("#current-time").text(now);
}

function retrieveData() {
    database.ref().once("value")
        .then(snapshot => {
            updateTime();
            minsLoop(snapshot, "first");
        })
}   

//update the time display second using setInterval until 00 seconds is reached at which time the syncDisplay function
//changes the setInterval repeat timing for 60s
let systemInitDisplay = setInterval (function() {
    now = moment().format("HH:mm");  //update the current time which is only necessary for the end of the first minute
    syncDisplay();
}, intvlDelay); //set to 1s (1000ms) initially until the display and system sync then changed to 60000

//this called to perform the initial population of the train schedule
retrieveData();