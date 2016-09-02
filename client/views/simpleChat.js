Meteor.subscribe("simpleChatMessages");

var staleTime = 10000;

Template.muteButtonsimpleChat.helpers({
    volumeIcon: function() {
        if (Session.get("mute")) {
            return "icon-volume-off";
        } else {
            return "icon-volume-up";
        }
    }
});

Template.export.helpers({

});

Template.export.events({
    "click button": function(e, tpl) {
        Meteor.call('exportJSON', {
            session: Session.get('session'),
            pm: Session.get('pm'),
            userId: Meteor.userId()
        }, function(err, data) {
            Router.go('/exports/' + data);
            // window.location = '/exports/' + data;
        });
    }
});

Template.nickModalSimpleChat.events({
    "click #login-buttons-logout": function(event) {
        location.reload();
    }
});

Template.nickModalSimpleChat.events({
    'keypress input': function(event) {
        if (event.charCode == 13) {
            event.stopPropagation();
            $('#login-buttons-password').trigger('click');
            return false;
        }
    }
});

Template.messagesInputSimpleChat.events({
    "submit #messageForm": function(event) {
        event.preventDefault();
        var $message, message;
        var messageId = Random.id();

        $message = event.target.messageInput.value.trim();
        event.target.messageInput.value = "";

        if ($message) {
            Meteor.call('newMessageSimpleChat', {
                body: $message,
                msgId: messageId,
                user_id: Meteor.userId(),
                session: Session.get('session'),
                pm: Session.get('pm')
                // timestamp is added on the server side
            });
        }
    }
});

Template.messagesSimpleChat.helpers({
    messages: function() {
        // return simpleChatMessages.find({});

        if (Session.get('pm') == 'true') {
            return simpleChatMessages.find({
                $or: [{
                    $and: [{
                        session: Session.get('session')
                    }, {
                        user_id: Meteor.userId()
                    }, {
                        pm: 'true'
                    }]
                }, {
                    $and: [{
                        session: Meteor.userId()
                    }, {
                        user_id: Session.get('session')
                    }, {
                        pm: 'true'
                    }]
                }]
            }, {
                $sort: {
                    'timestamp': 1
                }
            });
        } else {
            return simpleChatMessages.find({
                $and: [{
                    session: Session.get('session')
                }, {
                    pm: 'false'
                }]
                // session: Session.get('session')
            }, {
                $sort: {
                    'timestamp': 1
                }
            });
        }
    },
    currentEmail: function() {
        return Meteor.user().emails[0].address;
    },
    userSentMessage: function(email) {
        return Meteor.user().emails[0].address == email;
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
    id: function() {
        return this._id;
    }
});

// Template.messagesRequester.events = {
//     "click button": function(e, template) {
//         Meteor.call($(e.currentTarget).val(), [this._id, Session.get("workerId")]);
//     }
// };