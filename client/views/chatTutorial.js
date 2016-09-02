var staleTime = 10000;


Meteor.startup(function() {

});


Template.messagesChatWorkerTutorial.helpers({
    //TODO: maybe have a voting method
});


Template.messagesChatWorkerTutorial.events = {
    "click button": function(e, template) {
        Meteor.call($(e.currentTarget).val(), [this._id, Session.get("workerId")]);
    }
};

Template.memoryChatWorkerTutorial.helpers({
    memoryId: function() {
        return this._id;
    },
    toggleMessagesId: function() {
        return this._id;
    },
    memory: function() {
        return Memory.find({}, {
            sort: {
                timestamp: 1
            }
        });
    }
});

Template.memoryChatWorkerTutorial.events = {
    "click .makeClickable": function(e, template) {
        e.preventDefault();
        // var TIME_TO_FADE = 3000;
        if (e.currentTarget.id === "memfact1") {
          $("#chatInstrModal").modal({
              keyboard: false,
              backdrop: "static"
          });
        }
    }
};

Template.chatInstrModal.events = {
    "click .tutShow": function (e) {
        e.preventDefault();
        $('#chatInstrModal').modal('hide');
    }
};

Template.messagesInputChatWorkerTutorial.helpers({

});

Template.messagesInputChatWorkerTutorial.events({
    "submit #messageForm": function(event) {
        event.preventDefault();

        // check to see that user typed in sentence properly
        var typedIn = $("#messageInput").val().trim();
        var testStr = "are you allergic to cheese?";
        if (typedIn != testStr) {
            alert("The text you entered doesn't match the instructions. Please type the input text carefully! Be aware of extra spaces.");
            $("#messageInput").val("");
        } else {
            //console.log("yay you can read!");
            $("#messagesInner").append("<p class=" + "messageRow crowd accepted" + "timestamp=" + "timestamp" + "><span class=" + "timestamp" + ">14:16</span> <strong>chatWorker3:</strong>are you allergic to cheese?</p>");
            $("#messageInput").val("");
            alert("Great job! Messages are invisible to the requester until other workers agree that they're helpful. Now, we will route you to the waiting page for further instructions.");

            // route to proper page
            // grab the URL params first
            var url = "https://legionpowered.net/LegionToolsv2/tutorialDone.html";
            window.location = url;
      }
    }
});




// $("#messageForm").submit(function (e) {
//         e.preventDefault();
//
//         // check to see that user typed in sentence properly
//         var typedIn = $("#messageInput").val().trim();
//         var testStr = "alex";
//         if (typedIn != testStr) {
//             alert("The text you entered doesn't match the instructions. Please type the input text carefully! Be aware of extra spaces.")
//                 $("#messageInput").val("");
//         } else {
//             //console.log("yay you can read!");
//             $("#acceptedMessage").append("<p class=" + "messageRow crowd accepted" + "timestamp=" + "timestamp" + "><span class=" + "timestamp" + ">14:16</span> <strong>chatWorker3:</strong>are you allergic to cheese?</p>");
//             $("#messageInput").val("");
//             alert("Great job! Messages are invisible to the requester until other workers agree that they're helpful. Now we will route you to the waiting page for further instructions.");
//
//             // route to proper page
//             // grab the URL params first
//             var url = "https://legionpowered.net/LegionToolsv2/tutorialDone.html";
//             window.location = url;
//         }
//     });
