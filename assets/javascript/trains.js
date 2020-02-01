//@ts-check

const baseDate = "2020-01-02";
let firstTime = 0;
let noEntry = 1;
let trainData = {};
let arrIDs = [];
let errorCheck = 0;
let rows = [];
// let trainSched = [];
// let newMoment = moment();
let now;
let rowNoTrain = 0;
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


// function populateTrSched(timeInfo, when) 
//     if (when === "first") rowNoMins = 0;


//listen for firebase value events and add the data to the webpage
//database.ref().on("value", function(snapshot) { //this works but may not need to do it for every change to the database
//listen for firebase child_added events the resulting snapshot only yields the added child
//this is triggered when a new station is added to the database
//from Stack Overflow https://stackoverflow.com/questions/11788902/firebase-child-added-only-get-child-added


database.ref().orderByKey().limitToLast(1).on("child_added", function(snapshot) {
    console.log("Did the path make it here for the update?");
    console.log(snapshot.val());
    if (!noEntry) {  //noEntry === 1 prevents this from running, child_added listener 
                     //triggers once immediately and then every time a child is added
                     //this is to prevent the below from happening in the first instance
        noEntry = 0;
        populateTrain(snapshot, "later");
        // calculateMins(snapshot, "later");
        $("tbody").html("");
        snapshot.forEach(function(childSnapshot) {
            $("tbody").append("<tr id=row" + rowNoTrain + ">");
            rows.push("#row" + rowNoTrain); //populate an array for later use in updating times
            let trainObj = childSnapshot.val();
            // console.log(trainObj);
            //this is the order stored in firebase trainname (position 3), destination (position 0) and frequency (position 1)
            let trainOrder = ["trainname", "destination", "frequency", "currenttime"];
            trainOrder.forEach(function (value, index) {
                let trainInfo = $("<td>");
                trainInfo.text(trainObj[value]);
                $("#row" + rowNoTrain).append(trainInfo);
            })
        })
    }
    else {
        console.log("child added was prevented from running");
    }
})

function clearForm() {
    $("#train-input").val("");
    $("#dest").val("");
    $("#start-time").val("");
    $("#freq").val("");
}

function trialPush() {
    let key = database.ref().push().getKey();
    arrIDs.push
}

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
        modalErrors = modalErrors + "\t\t- First train time in 24 hour " +
            "format (hh:mm) - re-enter a valid time.\n";
        errorCheck += 1;
    }

    //check train frequency is a number, integer and between 5 and 180 minutes
    let freqCheck = Number($("#freq").val().trim());
    // if(isNaN(freqCheck) || !Number.isInteger(freqCheck) || freqCheck > 180 || freqCheck < 5) {
    if(isNaN(freqCheck) || !Number.isInteger((freqCheck)) || freqCheck > 180 || freqCheck < 5) {
        modalErrors = modalErrors + "\t\t- Train frequency in whole minutes between 5 and 180 " +
            "minutes - \tre-enter a valid frequency.\n";
        errorCheck += 1;
    }
    if (errorCheck > 0) {
        $("#modal-message").text("You have not entered valid entries for the " + 
            "following:\n" + modalErrors);
        $("#modal-validate").modal("show");
    }
}

$(document).on("click", "#submit-button, #confirm-button", function(event) {
    event.preventDefault();
    if ($(this).attr("id") === "submit-button") {
        validateEntries();
        if (errorCheck === 0) {
            assignEntries();
        }
        errorCheck = 0;
    }
    else if ($(this).attr("id") === "confirm-button") {
        console.log("Going here");
        $("#modal-confirmentry").modal("hide");
        loadFormData();
        clearForm();
    }
})

//3 scenarios for populating minutes 2 methods passed from retrieveData (1 minute updates and first update) and the other from
//regular 1 minute updates via minuteMon 

function calculateMins(dbInfo, when) {  //relies on the global trainObj for information
    console.log("calculate trainObj: " + JSON.stringify(dbInfo));
    let trainTime = {};
    if (when === "first") rowNoMins = 0; //do we update all times regardless of the circumstances?
    dbInfo.forEach(function(child) {
        let trainSched = child.val();
        console.log(trainSched.starttime)
        trainTime.startTime = moment(baseDate + " " + trainSched.starttime);
        trainTime.currentTime = moment(baseDate + " " + now);
        trainTime.freq = parseInt(trainSched.frequency);
        console.log("Start Time: " + trainTime.startTime);
        console.log("Current Time: " + trainTime.currentTime);
        trainTime.diffNowStart = trainTime.currentTime.diff(trainTime.startTime, "minutes"); //working
        console.log("Difference: " + trainTime.diffNowStart);
        trainTime.ratio = trainTime.diffNowStart / trainTime.freq;
        console.log("Ratio: " + trainTime.ratio);
        console.log("Frequency: " + trainTime.freq);
        if (trainTime.diffNowStart < 0) {
            trainSched.nexttrain = trainTime.startTime;
            trainSched.minutes = Math.abs(trainTime.diffNowStart);
        }
        else if (trainTime.ratio < 1) {
            trainSched.nexttrain = moment(trainTime.startTime).add(trainTime.freq, "minutes");
            trainSched.minutes = moment(trainSched.nexttrain.diff(trainTime.currentTime)).format("mm");//.format("HH:mm");
        }
        else {
            console.log("Rounded ratio: " + Math.ceil(trainTime.ratio))
            console.log(typeof(trainTime.ratio));
            console.log(typeof(trainTime.freq));
            console.log("2 times: " + Math.ceil(trainTime.ratio) * trainTime.freq);
            trainSched.nexttrain = trainTime.startTime.add(Math.ceil(trainTime.ratio) * trainTime.freq, "minutes");
            trainSched.minutes = moment(trainSched.nexttrain.diff(trainTime.currentTime)).format("mm");
        }
        
        console.log(trainSched.minutes);
        trainSched.nexttrain = trainSched.nexttrain.format("HH:mm");
        console.log("Next train time: " + trainSched.nexttrain);
        let trainOrder = ["nexttrain", "minutes"];
        //get rid of the existing next arrival and minutes away columns for each row in turn if it currently exists
        let cellIdents = "tr[id='row" + rowNoMins + "'] td:nth-child(4), tr[id='row" + 
            rowNoMins + "'] td:nth-child(5)";
        if ($(cellIdents).length) { //if this variable has a length then it exists
            $(cellIdents).remove();
        }
        //populate or repopulate the next arrival and minutes away columns for each row in turn
        trainOrder.forEach(function (value, index) {
            let trainInfo = $("<td>");  
            trainInfo.text(trainSched[value]);
            $("#row" + rowNoMins).append(trainInfo);
        })
        rowNoMins++;
        console.log("Minutes Row No: " + rowNoMins);
    })
}
     
    // let ratio = diffNowStart/freq;
    // if (ratio < 1) {
    //     trainObj.nexttrain = moment(moment(starttime).add(freq, "minutes")).format("HH:mm");
    // }
    // else {
    //     trainObj.nexttrain = moment(moment(starttime).add(Math.ceil(ratio) * freq, "minutes")).format("HH:mm");
    // }
    // console.log(trainObj.nexttrain);
    // trainObj.minutes = momenst(moment(trainObj.nexttrain).diff(moment(now), "minutes"));
    // console.log(trainObj.minutes);

    // console.log(diffNowStart);

    // database.ref().on("value", function(snapshot) {
    //     let i = 0;
    //     snapshot.forEach(function(childSnapshot) {
    //             trainSched.push({startime: childSnapshot.val()["starttime"], frequency: childSnapshot.val()["frequency"]});
    //             console.log(trainSched);
    //     })
    // })
// }

function minuteMon(delay) {
    $("#current-time").text(now);
    setInterval(function() {
        retrieveData();
    }, delay);
}

function loopFBVals(trainObj) {
    //this is the order stored in firebase trainname (position 3), destination (position 0) and frequency (position 1)
    let trainOrder = ["trainname", "destination", "frequency"];
    console.log("Last location dbInfo: " + JSON.stringify(trainObj));
    // console.log(trainObj.trainname);
    // console.log(trainObj["trainname"]);
    // console.log(trainObj.destination);
    // console.log(trainObj.frequency);
    trainOrder.forEach(function (value, index) {
        let trainInfo = $("<td>");
        trainInfo.text(trainObj[value]);
        $("#row" + rowNoTrain).append(trainInfo);
    })
}

function populateTrain(dbInfo, when) {
    let trainObj;
    console.log("make it here to populate train? " + JSON.stringify(dbInfo));
    // let trainOrder = ["trainname", "destination", "frequency"];
    if (when === "first") {
        rowNoTrain = 0;
        $("tbody").html("");
        // const keys = Object.keys(dbInfo);
        // console.log("Object into array: " + keys);
        dbInfo.forEach(function(child) {
            $("tbody").append("<tr id=row" + rowNoTrain + ">");
            trainObj = child.val();
            console.log(trainObj);
            console.log("Row No: " + rowNoTrain);
            // calculateMins();// console.log(child);
            //calculateMins(trainObj);
              
            loopFBVals(trainObj);
            // trainOrder.forEach(function (value, index) {
            //     let trainInfo = $("<td>");
            //     trainInfo.text(trainObj[value]);
            //     $("#row" + rowNoTrain).append(trainInfo);
            // })
            rowNoTrain++;
        })
        calculateMins(dbInfo, when); //this required to populate the next arrival and minutes columns within the first 60s 
    }
    else if (when === "later") {
        trainObj = dbInfo.val();
        loopFBVals(trainObj);
        // trainOrder.forEach(function (value, index){
        //     let traininfo = $("<td>");
        //     traininfo.text(dbInfo.val()[value]);
        //     $("#row" + rowNoTrain).append(trainInfo);
        // })
    }
    console.log("populate trainObj: " + JSON.stringify(trainObj));
    // calculateMins(dbInfo, when);
}

function syncDisplay() {
    //this is the point where the system clock has just reached 60s and therefore the display can now be
    //synchronised, the interval can also be changed to monitoring every minute instead of every second
    //this should only execute once to clear the 1s period setInterval, change the delay interval to 60s
    //and run the setInterval routine at 60s
    if (moment().seconds() === 0 && !firstTime) {
        console.log("How many times are we going through this procedure?")
        console.log(moment().format("HH:mm"));
        intvlDelay = 60000;
        firstTime += 1; //this prevents this procedure from running again
        clearInterval(systemInitDisplay); //clear the setInterval which monitored every 1s DECOMMENT THIS!!!!!
        minuteMon(intvlDelay); //intiate the setInterval which monitors every 60s
    }
}

function updateTime() {
    //if nothing is displayed then display it now instead of waiting for the first 60 seconds to elapse
    now = moment().format("HH:mm");
    if ($("#current-time").text().trim() === "") { 
        database.ref().once("value", function(data) {
            // console.log("updateTime: " + JSON.stringify(data));
            populateTrain(data, "first");
        })
        //     .then(snapshot => {  probably delete this 31/1
        //         console.log("updateTime: " + JSON.stringify(snapshot));
        //         populateTrain(snapshot, "first");
        // })
    }
   
    //this is the only part of the procedure that runs each time after the first few iterations required to 
    //synchronise seconds between the system clock and the displayed time
    console.log("Current Time: " + now);
    $("#current-time").text(now);
    // calculateMins();
}

function retrieveData() {
    database.ref().once("value")
        .then(snapshot => {
            updateTime();
            calculateMins(snapshot, "first");
        })
}   

//update the time display every minute using setInterval
let systemInitDisplay = setInterval (function() {
    now = moment().format("HH:mm");  //update the current time which is only necessary for the end of the first minute
    syncDisplay();
}, intvlDelay); //set to 1s (1000ms) initially until the display and system sync then changed to 60000

retrieveData();

//         // checkFreq();
//     }
//     else {
//         //pass
    
// }, function(errorObject) {
//     console.log("Errors: " + errorObject.code);
// })



// database.ref().on("value", function(values) {
//     console.log(values.val());
//     console.log(values.val().trainname);
//     console.log(values.val().destination);
//     console.log(values.val().starttime);
//     console.log(values.val().frequency)
// })
