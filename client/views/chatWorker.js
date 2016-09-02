var staleTime = 10000;

var prevChatMemIdClicked = "";

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars() {
    var vars = [],
        hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}


Template.chatWorker.helpers({
    session: getUrlVars()['session'],
    showMemory: function() {
        if (getUrlVars()['memory'] == 'true')
            return true;
        else
            return false;
    }
});

Template.muteButtonChatWorker.helpers({
    volumeIcon: function() {
        if (Session.get("mute")) {
            return "icon-volume-off";
        } else {
            return "icon-volume-up";
        }
    }
});

Template.messagesChatWorker.helpers({
    messages: function() {
        return Messages.find({
            $or: [{
                session: getUrlVars()['session']
            }, {
                user_id: getUrlVars()['session']
            }]
        }, {
            $sort: {
                'timestamp': 1
            }
        });
    },
    memSnapShotFlag: function() {
        return ((numSuccessfulMessages % 10) == 0);
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
    votable: function() {
        return (Session.get("role") === "crowd" || Session.get("part") === "m") &&
            this.role === "crowd" &&
            Session.get("workerId") !== this.workerId &&
            !this.successful;
    },
    voted: function() {
        if (this.votedIds) {
            var id = Session.get("workerId");
            return this.votedIds.some(function(e) {
                return id === e;
            }) ? (function() {
                return "unvote";
            })() : (function() {
                return "vote";
            })();
        }
        return "vote";
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
    },
    showMemory: function() {
        if (getUrlVars()['memory'] == 'true')
            return true;
        else
            return false;
    }
});


Template.messagesChatWorker.events = {
    "click button": function(e, template) {
        Meteor.call($(e.currentTarget).val(), [this._id, Session.get("workerId")]);
    }
    // ,
    // "click .makeClickable": function (e, template) {
    //     // if ( (e.currentTarget.id.indexOf("stale") > -1) || (e.currentTarget.id.indexOf("accepted") > -1) ) {
    //     //   // if we are in this function, that means a message was clicked on
    //     //   // we should show the message and ask why this was important
    //     //   console.log(e.currentTarget.id);
    //     //   $("#".concat(e.currentTarget.id)).css("background-color", "yellow");
    //     //
    //     // }
    //
    //     console.log(e.currentTarget.id);
    //
    //     $("#".concat(e.currentTarget.id)).css("background-color", "yellow");
    //
    // }
};

Template.memoryChatWorker.helpers({
    memoryId: function() {
        return this._id;
    },
    toggleMessagesId: function() {
        return this._id;
    },
    memory: function() {
        return Memory.find({
            session: getUrlVars()['session']
        }, {
            sort: {
                timestamp: 1
            }
        });
    }
});

Template.memoryChatWorker.events = {
    "click .makeClickable": function(e, template) {
        e.preventDefault();
        // var TIME_TO_FADE = 3000;
        var typeOfWorker = Session.get("part");
        var elemId = e.currentTarget.id;
        // console.log("clicked on " + elemId);

        if (prevChatMemIdClicked != elemId) {
            prevChatMemIdClicked = elemId;

            $(".addBorder").removeClass("addBorder");
            $("#".concat(elemId)).addClass("addBorder");

            var memoryText = "";
            if (typeOfWorker == "c") {
                memoryText = $.trim($("#".concat(elemId)).text().trim());
            } else if (typeOfWorker == "m") {
                memoryText = $("#".concat(elemId)).find(".btn").attr("value");
            }

            // console.log("memorytext is: " + memoryText);
            // console.log(elemId);

            var memoryItem = Memory.find({
                memWhy: memoryText
            }).fetch();
            var msgIdsForMemoryItem = [];

            memoryItem.forEach(function(item) {
                msgIdsForMemoryItem = item.memMsgIds;
                //console.log(msgIdsForMemoryItem);
            });

            // once we have the messages, we want to scroll back up ONLY IF we are a crowd chat worker
            // if we are a crowd memory worker, then we will just open an accordion with the messages in this memory item

            $(".msgDiv").removeClass("clickedOn");
            if (typeOfWorker == "c") {
                // highlight all the messages
                // for each of the message ids linked to the memory, find the corresponding div and toggle its class
                var divId;
                for (var i = 0; i < msgIdsForMemoryItem.length; i++) {
                    // console.log(msgIdsForMemoryItem[i]);

                    var mappingObj = MsgToDivMap.findOne({
                        messageId: msgIdsForMemoryItem[i]
                    });
                    divId = mappingObj.divId;
                    // console.log(divId);

                    $("#".concat(divId)).addClass("clickedOn");
                    // setTimeout(function () {
                    //   for (var i = 0; i < msgIdsForMemoryItem.length; i++) {
                    //       $("#".concat(msgIdsForMemoryItem[i])).removeClass("clickedOn");
                    //   };
                    // }, TIME_TO_FADE);

                };

                // scroll to message(s) if needed (if there's a message that's out of view, add a button to scroll up)
                // get the one that's furthest away
                var furthestAway = $("#".concat(divId)).position().top;
                for (var i = 0; i < msgIdsForMemoryItem.length; i++) {
                    var distance = $("#".concat(divId)).position().top;
                    //console.log("distance is: " + distance + " and furthestAway is: " + furthestAway);
                    if (distance < furthestAway) {
                        furthestAway = distance;
                    }
                }
                $("#messagesInner").scrollTop($("#messagesInner").scrollTop() + furthestAway);
            }
        } else {
            $(".addBorder").removeClass("addBorder");
            $(".msgDiv").removeClass("clickedOn");
            prevChatMemIdClicked = "";
        }
    }
};

Template.messagesInputChatWorker.helpers({
    showMemory: function() {
        if (getUrlVars()['memory'] == 'true')
            return true;
        else
            return false;
    }
});

Template.messagesInputChatWorker.events({
    "submit #messageForm": function(event) {
        event.preventDefault();
        var $message, message;
        var messageId = Random.id();

        $message = event.target.messageInput.value.trim();
        console.log($message);
        event.target.messageInput.value = "";

        // console.log(Session.get("workerId"));
        if ($message) {
            Meteor.call('newMessage', {
                workerId: Session.get("workerId"),
                body: $message,
                task: Session.get("task"),
                role: Session.get("role"),
                part: Session.get("part"),
                msgId: messageId,
                session: getUrlVars()['session']
                // timestamp is added on the server side
            });
        }
    }
});