//@ts-check
let trainData = {};
let errorCheck = 0;
let trainObj = {};

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

function clearForm() {
    $("#train-input").val("");
    $("#dest").val("");
    $("#start-time").val("");
    $("#freq").val("");
}

function loadFormData() {
    //load validated data into the firebase database
    database.ref().push({
        trainname: trainData.trainName,
        destination: trainData.dest,
        starttime: trainData.startTime,
        frequency: trainData.freq
    });
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
            "minutes - \t\t\t\t\tre-enter a valid frequency.\n";
        errorCheck += 1;
    }
    if (errorCheck > 0) {
        $("#modal-message").text("You have not entered valid entries for the " + 
            "following:\n" + modalErrors);
        $("#modal-validate").modal("show");
    }
}

//listen for firebase value events
database.ref().on("value", function(snapshot) {
    $("tbody").html("");
    let i = 0;
    snapshot.forEach(function(childSnapshot) {
        $("tbody").append("<tr id=row" + i + ">");
        trainObj = childSnapshot.val();
        console.log(trainObj);
        //this is the order storedin firebase trainname (position 3), destination (position 0) and frequency (position 1)
        let trainOrder = ["trainname", "destination", "frequency"];
        trainOrder.forEach(function (value, index) {
            let trainInfo = $("<td>");
            trainInfo.text(trainObj[value])
            $("#row" + i).append(trainInfo)
        })
        i++;
    })
})


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

//         // checkFreq();
//     }
//     else {
//         //pass
    
// }, function(errorObject) {
//     console.log("Errors: " + errorObject.code);
})



// database.ref().on("value", function(values) {
//     console.log(values.val());
//     console.log(values.val().trainname);
//     console.log(values.val().destination);
//     console.log(values.val().starttime);
//     console.log(values.val().frequency)
// })
