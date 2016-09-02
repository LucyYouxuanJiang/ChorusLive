var staleTime = 100000;

// Meteor.subscribe('requester');

Template.requester.helpers({
    notLoggedIn: function() {
        if (Meteor.userId())
            return false;
        else
            return true;
    }
});

Template.muteButtonRequester.helpers({
    volumeIcon: function() {
        if (Session.get("mute")) {
            return "icon-volume-off";
        } else {
            return "icon-volume-up";
        }
    }
});

Template.nickModalRequester.events({
    "click #login-buttons-logout": function(event) {
        location.reload();
    }
});

Template.nickModalRequester.events({
    'keypress input': function(event) {
        if (event.charCode == 13) {
            event.stopPropagation();
            $('#login-buttons-password').trigger('click');
            return false;
        }
    }
});

Template.messagesInputRequester.helpers({
    chatOrRequester: function() {
        return ((Session.get("part") == "c") || (Session.get("role") == "requester"));
    },
    chatWorker: function() {
        return (Session.get("part") == "c");
    },
    requester: function() {
        return (Session.get("role") == "requester");
    }
});

Template.messagesInputRequester.events({
    "submit #messageForm": function(event) {
        event.preventDefault();
        var $message, message;
        var messageId = Random.id();

        $message = event.target.messageInput.value.trim();
        event.target.messageInput.value = "";

        // console.log(Session.get("workerId"));
        if ($message) {
            Meteor.call('newMessage', {
                workerId: Session.get("workerId"),
                body: $message,
                session: Session.get("session"),
                role: Session.get("role"),
                part: Session.get("part"),
                msgId: messageId,
                user_id: Meteor.userId(),
                session: Meteor.userId()
                // timestamp is added on the server side
            });
        }
    }
});

Template.registerHelper('equals', function(a, b) {
    return a == b;
});

Template.messagesRequester.helpers({
    messages: function() {
        return Messages.find({
            $or: [{
                session: Meteor.userId()
            }, {
                user_id: Meteor.userId()
            }]
        }, {
            $sort: {
                'timestamp': 1
            }
        });
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

Template.messagesRequester.events = {
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
