var MEMSNAPSHOTWINDOW = 10;
var staleTime = 10000;

var MemoryTut = new Mongo.Collection(null);
var MessagesTutorial = new Mongo.Collection(null);
var MsgToDivMapTut = new Mongo.Collection(null);

function loadConvo(part, session, role) {
    if (!part || !session || !role) return;

    Meteor.call('readJsonFile', part, session, role, function(error, response) {
        var convos = JSON.parse(response).convos;

        var twoMinsLater = new Date();
        for (var i = 0; i < convos.length; i++) {
            var newMsg = {};
            newMsg["body"] = convos[i].body;
            newMsg["workerId"] = convos[i].workerId;
            newMsg["votes"] = 1;
            newMsg["part"] = Session.get("part");
            newMsg["session"] = Session.get("session");
            var randOffset = Math.floor(Math.random() * (20 - 1 + 1)) + 1;
            twoMinsLater.setMinutes(twoMinsLater.getMinutes() + randOffset);
            newMsg["timestamp"] = twoMinsLater.getTime();
            newMsg["role"] = Session.get("role");
            newMsg["successful"] = true;
            newMsg["msgId"] = Random.id();

            MessagesTutorial.insert(newMsg);
        }
        // console.log(convos);
    });
}

Meteor.startup(function() {

    // alert("calling from memoryTutorial.js");
    // populate tutorial messages only if we're in tutorial right now
    if ((window.location.pathname == "/tutorial") && (window.location.search.indexOf("part=m"))) {
        loadConvo(Session.get('part'), Session.get('session'), Session.get('role'));
    }

});


Template.messagesMemoryWorkerTutorial.helpers({
    messages: function() {
        return MessagesTutorial.find({
            "successful": true,
            "role": "memTutorial",
            "session": Session.get("session")
        }, {
            sort: {
                timestamp: -1
            },
            limit: MEMSNAPSHOTWINDOW
        }).fetch().reverse();
    },
    memSnapShotFlag: function() {
        return ((MEMSNAPSHOTWINDOW % MEMSNAPSHOTWINDOW) == 0);
    },
    pretty_ts: function(timestamp) {
        var d, min;
        if (!timestamp) {
            return;
        }
        d = new Date(timestamp);
        min = d.getMinutes();
        min = min < 10 ? "0" + min : min;
        return d.getHours() + ":" + min;
    },
    role: function() {
        //todo: if message is successful display as it's class as if it were a requester's message to distinguish it as successful to workers
        return this.role;
    },
    id: function() {
        return this._id;
    },
    isStale: function(msgTime) {
        return (new Date).getTime() > (msgTime + staleTime); // Classify prior messages older than 200s as stale
    },
    onlineCount: function() {
        return Meteor.users.find({
            "status.online": true
        }).count()
    },
    cboxId: function() {
        return Random.id();
    },
    staleMessageID: function() {
        // staleMessageID = "staleMsg_".concat(this._id);
        // return staleMessageID;
        return this._id;
    },
    acceptedMessageID: function() {
        // accMessageID = "acceptedMsg_".concat(this._id);
        // return accMessageID;
        return this._id;
    },
    unacceptedMessageID: function() {
        // return "unaccMsg_".concat(this._id);
        return this._id;
    }
});

Template.messagesForMemoryTutorial.helpers({
    messages: function() {
        return MessagesTutorial.find({
            "successful": true,
            "role": "memTutorial",
            "session": Session.get("session")
        }, {
            sort: {
                timestamp: -1
            },
            limit: MEMSNAPSHOTWINDOW
        }).fetch().reverse();
    },
    memSnapShotFlag: function() {
        return ((MEMSNAPSHOTWINDOW % MEMSNAPSHOTWINDOW) == 0);
    },
    pretty_ts: function(timestamp) {
        var d, min;
        if (!timestamp) {
            return;
        }
        d = new Date(timestamp);
        min = d.getMinutes();
        min = min < 10 ? "0" + min : min;
        return d.getHours() + ":" + min;
    },
    role: function() {
        //todo: if message is successful display as it's class as if it were a requester's message to distinguish it as successful to workers
        return this.role;
    },
    id: function() {
        return this._id;
    },
    isStale: function(msgTime) {
        return (new Date).getTime() > (msgTime + staleTime); // Classify prior messages older than 200s as stale
    },
    onlineCount: function() {
        return Meteor.users.find({
            "status.online": true
        }).count()
    },
    cboxId: function() {
        return Random.id();
    },
    staleMessageID: function() {
        // staleMessageID = "staleMsg_".concat(this._id);
        // return staleMessageID;
        return this._id;
    },
    acceptedMessageID: function() {
        // accMessageID = "acceptedMsg_".concat(this._id);
        // return accMessageID;
        return this._id;
    },
    unacceptedMessageID: function() {
        // return "unaccMsg_".concat(this._id);
        return this._id;
    }
});

Template.memoryMemoryWorkerTutorial.helpers({
    memory: function() {
        return MemoryTut.find({}, {
            sort: {
                timestamp: 1
            }
        });
    },
    memoryId: function() {
        return this._id;
    }
});


Template.memoryInputMemoryWorkerTutorial.events = {
    "click .addtoMem": function(e) {
        e.preventDefault();
        $(".makeClickable").removeClass("clickedOn");

        $("#memInstrModal").modal({
            keyboard: false,
            backdrop: "static"
        });

    }
};


Template.instrModal.events = {
    "click .tutShow": function(e) {
        e.preventDefault();
        $('#memInstrModal').modal('hide');
        $("#memInfoModal").modal({
            keyboard: false,
            backdrop: "static"
        });
    }

};

Template.messagesForMemoryTutorial.events = {
    "click .makeClickable": function(e, template) {
        // console.log("clicked on ".concat(e.currentTarget.id));
        // debugger;
        // $("#".concat(e.currentTarget.id)).css("background-color", "yellow");
        $("#".concat(e.currentTarget.id)).toggleClass("clickedOn");

    }
};

Template.messagesForMemoryTutorial.helpers({
    memMsgId: function() {
        return ("memMsg_".concat(this._id));
    },
    msgsForMemory: function() {
        // show the last N messages, but when it comes to displaying, display in reverse order (so most recent message will be at the bottom)
        return MessagesTutorial.find({
            "successful": true,
            "role": "memTutorial",
            "session": Session.get("session")
        }, {
            sort: {
                timestamp: -1
            },
            limit: MEMSNAPSHOTWINDOW
        }).fetch().reverse();

    },
    pretty_ts: function(timestamp) {
        var d, min;
        if (!timestamp) {
            return;
        }
        d = new Date(timestamp);
        min = d.getMinutes();
        min = min < 10 ? "0" + min : min;
        return d.getHours() + ":" + min;
    },
    memSnapShotFlag: function() {
        return ((MEMSNAPSHOTWINDOW % MEMSNAPSHOTWINDOW) == 0);
    }
});


Template.memModalMemoryWorkerTutorial.events({
    "click .heresWhy": function(event, template) {
        event.preventDefault();
        // console.log("inside mem modal saving");
        var $warning, $memModalTxtBox, whyImp;
        // $warning = $(this).find(".warning");
        $warning = template.find(".warning");
        // $memModalTxtBox = $(this).find(".memModalTxtBox");
        $memModalTxtBox = template.find(".memModalTxtBox");
        whyImp = $("#memInput").val().replace(/^\s+|\s+$/g, "");
        // reset text
        $($warning).text("").html();
        $($memModalTxtBox).val("");

        var msgIdsArray = [];
        var idx;

        // $(".makeClickable").removeClass("clickedOn");

        // get a list of all divs with the clickedOn class
        // then get their IDs
        idx = 0;
        $(".clickedOn").each(function(index, element) {

            // take the content inside the div, then find the message in the Messages collection
            // then get the ID from that record and save it
            // console.log(this.id);
            var messageText = $("#".concat(this.id)).text().trim().split(":-")[1].slice(1); // the ":-" is our special recognition character pattern
            var wId = $("#".concat(this.id)).text().trim().split(":")[1].split(":-")[0].slice(3); // get the part between the time stamp and the special chars
            var time = $("#".concat(this.id)).find(".memoryRow").attr("timestamp");
            var tStamp = new Date(Number(time));
            tStamp = tStamp.getTime();

            // console.log(messageText);
            // console.log(wId);
            // console.log(tStamp);

            // console.log(Messages.find({}).fetch());

            var messageItem = MessagesTutorial.findOne({
                body: messageText,
                workerId: wId,
                timestamp: tStamp
            });

            // console.log(messageItem);
            // console.log((this.id).split("_")[1]);
            // // console.log(messageItem.msgId);

            msgIdsArray[idx] = messageItem.msgId;
            // console.log(msgIdsArray[idx]);

            // console.log("updating msgDivMap");
            // update the Div to Message map
            Meteor.call("updateMsgDivMap", {
                messageId: messageItem.msgId,
                divId: (this.id).split("_")[1]
            });

            idx++;
        });

        if (!whyImp && (msgIdsArray.length > 0)) {
            $($warning).text("Please add a description of why these messages are important!").html();
        } else if (msgIdsArray.length == 0) {
            $($warning).text("Please select at least one message!").html();
        } else {
            // console.log("adding fact to mem collection");
            //add the message ID, along with the justification, to the memory

            var newMem = {
                memWhy: whyImp,
                memMsgIds: msgIdsArray
            };
            MemoryTut.insert(newMem);

            // Meteor.call("newMemory", {
            // });

            // cleanup
            $(".makeClickable").removeClass("clickedOn");
            $('#memInfoModal').modal('hide');

        }

        // history.pushState(null, null, "/tasks?role=" + Session.get("role") + "&part=" + Session.get("part") + "&task=" +
        //     Session.get("task") + "&workerId=" + Session.get("workerId") + "&assignmentId=" + Session.get("assignmentId") +
        //     "&hitId=" + Session.get("hitId") + "&turkSubmitTo=" + Session.get("turkSubmitTo") + "&min=" +
        //     Session.get("min"));
        // hideMessageAlert();

        // $('#messageInput').focus();
    }
});


Template.memoryMemoryWorkerTutorial.events = {
    "click .collapseMsgListBtn": function(e, template) {
        e.preventDefault();

        console.log("inside the collapseMsgListBtn");

        var elemId = e.currentTarget.id;
        console.log(elemId);
        var dialogId = elemId + "_dialog";
        // console.log(dialogId);

        // only create the element if it doesn't exist
        var elemExistsFlag = document.getElementById(dialogId);
        console.log(elemExistsFlag);

        if (!elemExistsFlag) {
            // var memoryText = $("#".concat(elemId)).attr("value");
            var memoryText = $("#".concat(elemId)).text().trim();

            console.log("memorytext is: " + memoryText);
            console.log(elemId);

            var memoryItem = MemoryTut.find({
                memWhy: memoryText
            }).fetch();
            console.log(memoryItem);
            var msgIdsForMemoryItem = [];

            memoryItem.forEach(function(item) {
                msgIdsForMemoryItem = item.memMsgIds;
                // console.log(msgIdsForMemoryItem);
            });

            // console.log("element doesnt exist");
            // console.log(msgIdsForMemoryItem);
            str = "<div id='" + dialogId + "'>";
            for (var i = 0; i < msgIdsForMemoryItem.length; i++) {
                // for each id, go to the Messages collection and get the corresponding text
                // console.log(msgIdsForMemoryItem.length);
                var message = MessagesTutorial.findOne({
                    msgId: msgIdsForMemoryItem[i]
                });
                // console.log(message);
                // console.log(message);
                var userOrCrowd = "";

                str += "<p style='width:90%;' class='collMsgList collapseMsgList_" + dialogId + "'> --> " + message.workerId + ": " + message.body + "</p>";
            }
            str += " </div>";

            $("#".concat(elemId)).after(str);
            $("#".concat(dialogId)).addClass("addBorder");
            $(".collapseMsgList_".concat(dialogId)).slideDown();

            // at this point, tutorial is sucessfully finished
            // grab the URL params first, then, forward workers somewhere
            if (gup("direct") == "t") {
                alert("Great job! You successfully saved a fact about the user. Now we will route you to the main task page.");
                var sessionName = "solo_" + ((targetOnlyFlag) ? "target_" : "tools_") + gup("workerId") + "_" + pclName;
                //var nlQuery = "Only highlight and label relevant objects in order to successfully answer this query: 'Label both of the bowls and label the big mug.''";
                window.location =
                    "https://legionpowered.net:8445/tasks?role=crowd&part=m" +
                    "&workerId=" + gup("workerId") +
                    "&session=" + sessionName +
                    "&assignmentId=" + gup("assignmentId") +
                    "&turkSubmitTo=" + gup("turkSubmitTo") +
                    "&hitId=" + gup("hitId");
            } else {
                alert("Great job! You successfully saved a fact about the user. Now we will route you to waiting page for further instructions.");
                window.location = "https://legionpowered.net/LegionToolsv2/tutorialDone.html";
            }
        } else {
            // console.log("element does exist");
            $("#".concat(dialogId)).toggleClass("addBorder");
            $(".collapseMsgList_".concat(dialogId)).slideToggle();
        }
    },
    "click input[type=radio]": function(e, template) {
        // e.preventDefault();
        e.stopImmediatePropagation();
        // var elemId = $("input[type=radio][name^=likert_]:checked").attr("id");
        var elem = e.currentTarget.id;
        // console.log(elem);
        var radioVal = elem.split("_")[0];
        var radioId = elem.split("_")[1];
        console.log("memory elem is: " + radioId + " and value is: " + radioVal);

        //RANKING ADD/UPDATE
        // check to see if this memoryId already has rankings in the collection
        var messageList = [];
        var i = 0;
        $("#messagesInner").children(".msgDiv").each(function(k, v) {
            messageList[i] = this.id;
            i++;
        });

        console.log(messageList);
        // debugger;

        // var memRankObj = Ranks.find({
        //     memoryId: radioId
        // }).fetch();
        //
        // if ($.isEmptyObject(memRankObj)) {
        //     // add to the collection
        //     Meteor.call("addRanks", {
        //         memId: radioId,
        //         counter_1: 0,
        //         counter_2: 0,
        //         counter_3: 0,
        //         snapShots: messageList
        //     });
        // }

        // UPDATE THE SNAPSHOTS map



        // update the counter
        // Meteor.call("updateRanks", {
        //     memId: radioId,
        //     counterToUpdate: radioVal,
        //     snapShots: messageList
        // });

        // remove that list group
        $("#likertListGroup_".concat(radioId)).hide();

        // #####################################################################
        // #####################################################################
        // #####################################################################
        //
        // var data = [[0,1],[32, 67], [12, 79]];
        // var result = regression('linear', data);
        // console.log("result is: " + result);
        // debugger;

        // // get a list of all the memory ids and their counts
        // var allMemItems = Ranks.find({}, {});
        // var count = 0;
        // var memItemIds = [];
        // var memItemRanks = [];
        // allMemItems.forEach(function(memItem) {
        //     memItemIds[count] = memItem.memoryId;
        //     memItemRanks[count] = [memItem.counter_1, memItem.counter_2 + memItem.counter_3];
        //     count++;
        // });

    },
    "click #memoryInputText": function(e, template) {
        // $("#memInstrModal").modal({});
        $("#memInstrModal").show();
        // $("#memInfoModal").show();
    }
};
