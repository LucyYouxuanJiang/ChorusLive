var MEMSNAPSHOTWINDOW = 10;
var staleTime = 100000;

var msgsFromFile = gup("fromfile");
// console.log(msgsFromFile);

var MessagesFromFile = new Mongo.Collection(null);

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
            newMsg["msgId"] = Session.get("workerId") + "_" + i.toString();

            MessagesFromFile.insert(newMsg);
        }
        // console.log(convos);
    });
}

Meteor.startup(function() {
    if (msgsFromFile == "t") {
        loadConvo(Session.get('part'), Session.get('session'), Session.get('role'));
    }
});


Template.memory.helpers({
    session: function() {
      return gup("session");
    }
});

Template.memory.onRendered(function () {
    // call the turkify function
    mturkify();
});

Template.muteButtonMemoryWorker.helpers({
    volumeIcon: function() {
        if (Session.get("mute")) {
            return "icon-volume-off";
        } else {
            return "icon-volume-up";
        }
    }
});

Template.messagesMemoryWorker.helpers({
    messages: function() {
      if (msgsFromFile == "t") {
        return MessagesFromFile.find({
            $or: [{
                session: gup("session")
            }, {
                user_id: gup("session")
            }]
        }, {
            sort: {
                timestamp: -1
            },
            limit: MEMSNAPSHOTWINDOW
        }).fetch().reverse();
      }

      return Messages.find({
            $or: [{
                session: gup("session")
            }, {
                user_id: gup("session")
            }]
        }, {
            sort: {
                timestamp: -1
            },
            limit: MEMSNAPSHOTWINDOW
        }).fetch().reverse();
    },
    memSnapShotFlag: function() {
        // don't use the numSuccessfulMessages anymore. Use the last ten messages before the (currentTime - staleTime)
        // we want this flag to be true when we
        return ((numSuccessfulMessages % MEMSNAPSHOTWINDOW) == 0);
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
        if (msgsFromFile) {
          return this.workerId;
        }
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

Template.memoryMemoryWorker.helpers({
    memory: function() {
        // check to see if we are in LIVE MODE or DATA COLLECTION MODE
        // console.log("memWorkerId in memWorker: " + Session.get("workerId"));

        // IF IN DATA COLLECTION MODE
        if (Session.get("liveupdate") === "y") {
            return Memory.find({
                session: gup("session")
            }, {
                sort: {
                    timestamp: 1
                }
            });
        } else {
            // console.log("inside MemDataCollectionMode");
            return MemDataCollectionMode.find({
                session: gup("session"),
                workerId: Session.get("workerId")
            }, {
                sort: {
                    timestamp: 1
                }
            });
        }
    },
    memoryId: function() {
        return this._id;
    }
});

Template.prefilledMemory.helpers({
    prefilledMemory: function () {
        // load prefilledMemory for the task

    },
    prefill: function () {
        if (Session.get("prefilled") == "y") {
            return true;
        } else {
            return false;
        }
    }

});


Template.memoryInputMemoryWorker.events = {
    "click .addtoMem": function(e) {
        e.preventDefault();
        $(".makeClickable").removeClass("clickedOn");
        $('#memInfoModal').modal({
            // keyboard: false,
            // backdrop: "static"
        });
        $('#memInput').focus(); // Focus on the modal's textbox
    },
    "click #submitHIT": function(e) {
        // submit the mturk form
        // console.log($("#mturk_form").serialize());
        $("#mturk_form").submit();
        alert("Thank you for submitting the task! Your HIT is being processed and evaluated as part of a quality check. You'll be paid soon.");

    }

};

Template.messagesForMemory.events = {
    "click .makeClickable": function(e, template) {
        // console.log("clicked on ".concat(e.currentTarget.id));
        // debugger;
        // $("#".concat(e.currentTarget.id)).css("background-color", "yellow");
        $("#".concat(e.currentTarget.id)).toggleClass("clickedOn");

    }
};

Template.messagesForMemory.helpers({
    memMsgId: function() {
        return ("memMsg_".concat(this._id));
    },
    msgsForMemory: function() {
        // show the last N messages, but when it comes to displaying, display in reverse order (so most recent message will be at the bottom)
        if (msgsFromFile == "t") {
          return MessagesFromFile.find({
              $or: [{
                  session: gup("session")
              }, {
                  user_id: gup("session")
              }]
          }, {
              sort: {
                  timestamp: -1
              },
              limit: MEMSNAPSHOTWINDOW
          }).fetch().reverse();
        }

        return Messages.find({
            $or: [{
                session: gup("session")
            }, {
                user_id: gup("session")
            }]
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
        return ((numSuccessfulMessages % MEMSNAPSHOTWINDOW) == 0);
    },
    role: function() {
      if (msgsFromFile) {
        return this.workerId;
      }
      return this.role;
    }
});


Template.memModalMemoryWorker.events({
    "click .makeClickable": function(e, template) {
        e.preventDefault();
        // console.log("ald;ksfjal;skdjfl;aksdjf;lkadjs");
        $("#heresWhyButton").prop("disabled", false);
        $("#memInput").prop("disabled", false);
    },
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

            // console.log(Messages.find({}).fetch())lege

            var messageItem = {};
            if (msgsFromFile == "t") {
              messageItem = MessagesFromFile.findOne({
                body: messageText,
                //workerId: wId,
                session: Session.get("session"),
                timestamp: tStamp
              });
            } else {
              messageItem = Messages.findOne({
                body: messageText,
                //workerId: wId,
                session: Session.get("session"),
                timestamp: tStamp
              });
            }

            // console.log(messageItem);
            // console.log((this.id).split("_")[1]);
            // // console.log(messageItem.msgId);
            // debugger;
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
            Meteor.call("newMemory", {
                memWhy: whyImp,
                memMsgIds: msgIdsArray,
                session: gup("session"),
                liveUpdate: Session.get("liveupdate"),
                workerId: Session.get("workerId")
            });

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
    },
    "hidden.bs.modal #memInfoModal": function(e, template) {
        e.preventDefault();
        $("#heresWhyButton").prop("disabled", true);
        $("#memInput").prop("disabled", true);

        $warning = template.find(".warning");
        $memModalTxtBox = template.find(".memModalTxtBox");
        // reset text
        $($warning).text("").html();
        $($memModalTxtBox).val("");


    }
});


Template.memoryMemoryWorker.events = {
    "click .collapseMsgListBtn": function(e, template) {
        e.preventDefault();

        // console.log("inside the collapseMsgListBtn");

        var elemId = e.currentTarget.id;
        // console.log(elemId);
        var dialogId = elemId + "_dialog";
        // console.log(dialogId);

        // only create the element if it doesn't exist
        var elemExistsFlag = document.getElementById(dialogId);
        // console.log(elemExistsFlag);

        if (!elemExistsFlag) {
            // var memoryText = $("#".concat(elemId)).attr("value");
            var memoryText = $("#".concat(elemId)).text().trim();

            // console.log("memorytext is: " + memoryText);
            // console.log(elemId);

            // check to see what mode we are in
            var memoryItem;
            if (Session.get("liveupdate") === "y") {
                memoryItem = Memory.find({
                    memWhy: memoryText
                }).fetch();
            } else {
                memoryItem = MemDataCollectionMode.find({
                    memWhy: memoryText
                }).fetch();
            }

            // console.log(memoryItem);
            var msgIdsForMemoryItem = [];

            memoryItem.forEach(function(item) {
                msgIdsForMemoryItem = item.memMsgIds;
                // console.log(msgIdsForMemoryItem);
            });

            // console.log("element doesnt exist");
            // console.log(msgIdsForMemoryItem);
            var messageBody = "";

            // console.log(dialogId);
            if (dialogId.indexOf("abc_dialog") > -1) {
                var userOrCrowd = "Crowd: ";
                messageBody = "what's your typical budget?";

                str = "<div id='" + dialogId + "'>";
                str += "<p style='width:90%;' class='collMsgList collapseMsgList_" + dialogId + "'> --> " + userOrCrowd + " " + messageBody + "</p>";

                var userOrCrowd = "User: ";
                messageBody = "it depends on the city, but I try not to go over $20";
                str += "<p style='width:90%;' class='collMsgList collapseMsgList_" + dialogId + "'> --> " + userOrCrowd + " " + messageBody + "</p>";

                str += " </div>";

            } else if (dialogId.indexOf("def_dialog") > -1) {
                messageBody = "I have three kids that can't handle spicy food yet, so we don't go to those places for now.";
                var userOrCrowd = "User: ";

                str = "<div id='" + dialogId + "'>";
                str += "<p style='width:90%;' class='collMsgList collapseMsgList_" + dialogId + "'> --> " + userOrCrowd + " " + messageBody + "</p>";

                str += " </div>";

            } else if (dialogId.indexOf("ghi_dialog") > -1) {
                messageBody = "";
                var userOrCrowd = "User: ";

                str = "<div id='" + dialogId + "'>";
                str += "<p style='width:90%;' class='collMsgList collapseMsgList_" + dialogId + "'> --> " + userOrCrowd + " " + messageBody + "</p>";
                str += " </div>";
            } else {
                str = "<div id='" + dialogId + "'>";
                for (var i = 0; i < msgIdsForMemoryItem.length; i++) {
                    // for each id, go to the Messages collection and get the corresponding text
                    // console.log(msgIdsForMemoryItem.length);
                    var message = {};
                    if (msgsFromFile == "t") {
                      message = MessagesFromFile.findOne({
                        msgId: msgIdsForMemoryItem[i]
                      });
                    } else {
                      message = Messages.findOne({
                        msgId: msgIdsForMemoryItem[i]
                      });
                    }
                    // console.log(message);
                    var userOrCrowd = "";
                    if (msgsFromFile == "t") {
                      userOrCrowd = message.workerId + ": ";
                    } else {
                      userOrCrowd = message.role + ": ";
                    }
                    messageBody = message.body;

                    str += "<p style='width:90%;' class='collMsgList collapseMsgList_" + dialogId + "'> --> " + userOrCrowd + " " + messageBody + "</p>";
                }
                str += " </div>";
            }


            $("#".concat(elemId)).after(str);
            $("#".concat(dialogId)).addClass("addBorder");

            $(".collapseMsgList_".concat(dialogId)).slideDown();
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
        //console.log("memory elem is: " + radioId + " and value is: " + radioVal);

        //RANKING ADD/UPDATE
        // check to see if this memoryId already has rankings in the collection
        var messageList = [];
        var i = 0;
        $("#messagesInner").children(".msgDiv").each(function(k, v) {
            messageList[i] = this.id;
            i++;
        });

        // console.log(messageList);
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
        $("#memInfoModal").show();
    }
};
