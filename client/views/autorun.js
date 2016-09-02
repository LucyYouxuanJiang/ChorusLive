var gup, hideMessageAlert, instachat, scrollMessagesView, showUnreadMessagesAlert, unreadMessage;

var accMessageID, staleMessageID;


//
numSuccessfulMessages = 0;
var MEMSNAPSHOTWINDOW = 10;

// Params
// var staleTime = 100000;
var staleTime = 10000;

// Collection Subscriptions
Meteor.subscribe("tasks");
Meteor.subscribe("msgToDivMap");
Meteor.subscribe("ranks");

// App startup
Meteor.startup(function() {

    instachat.unreadMessageSound = new Audio("/sound/Electro_-S_Bainbr-7955.wav");
    $(window).resize();

    var task_name = Session.get("session");
    var task = Tasks.findOne({
        task: task_name
    });
    if (!task) {
        Tasks.insert({
            name: task_name
        });
    }

    scrollMessagesView();
    $("#messageInput").select();

    Session.set("role", (gup("role") || ""));
    Session.set("part", (gup("part") || ""));
    // Session.set("task", (gup("task") || ""));
    Session.set("assignmentId", (gup("assignmentId") || ""));
    Session.set("hitId", (gup("hitId") || ""));
    Session.set("turkSubmitTo", (gup("turkSubmitTo") || ""));
    Session.set("min", (gup("min") || ""));
    Session.set("liveupdate", (gup("liveupdate") || ""));
    Session.set("prefilled", (gup("prefilled") || ""));

    if (Session.get("role") === "requester") {
        $('#nickPickModal').modal({
            keyboard: false,
            backdrop: "static"
        });
        $('#nickInput').focus(); // Focus on the modal's textbox
    } else if (window.location.pathname == '/simpleChatLogin') {
        //This else if is so that in login phase for 1-1 chat the url won't change
    } else if (window.location.pathname.indexOf("chat") > -1) {
        Session.set("session", (gup("session") || ""));
        Session.set("pm", (gup("pm") || "false"));
        history.pushState(null, null, "/chat" + "?session=" + Session.get("session") + "&pm=" + Session.get("pm"));

        $('#messageInput').focus();
    } else if ((window.location.pathname == "/tasks") && (Session.get("role") === "crowd")) {
        // console.log("insidehereinsidehere");
        //console.log("before: " + Session.get("workerId"));
        Session.set("workerId", (gup("workerId") || Random.id()));
        // console.log("after: " + Session.get("workerId"));

        Session.set("session", (gup("session") || ""));
        Session.set("memory", (gup("memory") || "true"));
        Session.set("liveupdate", (gup("liveupdate") || "y"));
        Session.set("fromfile", (gup("fromfile") || "f"));

        // var messageId = Random.id();
        // Meteor.call("newMessage", {
        //     system: true,
        //     body: Session.get("workerId") + " just joined the room.",
        //     task: Session.get("task"),
        //     role: Session.get("role"),
        //     part: Session.get("part"),
        //     msgId: messageId
        // });

        history.pushState(null, null, "/tasks?role=" + Session.get("role") + "&part=" + Session.get("part") +
            "&workerId=" + Session.get("workerId") + "&assignmentId=" +
            Session.get("assignmentId") + "&hitId=" + Session.get("hitId") + "&turkSubmitTo=" +
            Session.get("turkSubmitTo") + "&min=" + Session.get("min") + "&memory=" + Session.get("memory") + "&session=" + Session.get("session") +
            "&prefilled=" + Session.get("prefilled") + "&liveupdate=" + Session.get("liveupdate") + "&fromfile=" + Session.get("fromfile")
        );

        $('#messageInput').focus();
        // alert(Session.get("workerId"));
    } else if (window.location.pathname == "/tutorial") {
        Session.set("part", (gup("part") || ""));
        Session.set("session", (gup("session") || "")); // == name of json file
        Session.set("role", (gup("role") || ""));

        history.pushState(null, null, "/tutorial?part=" + Session.get("part") + "&session=" + Session.get("session") +
            "&role=" + Session.get("role")
        );
    }
});

// Globals
instachat = {};
instachat.alertWhenUnreadMessages = false;
instachat.messageAlertInterval = null;
instachat.unreadMessages = 0;

Deps.autorun(function() {
    var task_name, role;
    task_name = Session.get("session");
    if (task_name) {
        return Meteor.subscribe(Session.get("role"), task_name);
    }
});

Deps.autorun(function() {
    return Meteor.subscribe("memory");
});

Deps.autorun(function() {
    return Meteor.subscribe("ranks");
});

Deps.autorun(function() {
    return Meteor.subscribe("messages");
});

Deps.autorun(function() {
    return Meteor.subscribe("snapShotsMap");
});

Deps.autorun(function() {
    return Meteor.subscribe("memDataCollectionMode");
})

Deps.autorun(function() {
    return Messages.find({
        "successful": true
    }).observe({
        added: function() {
            numSuccessfulMessages++;
        }
    });

});

Deps.autorun(function() {
    return Messages.find({
        session: Session.get("session")
    }).observe({
        added: function(item) {
            scrollMessagesView();
            if (!item.system) {
                return unreadMessage(item);
            }
        }
    });
});

Deps.autorun(function() {
    // if (Meteor.user() && Session.get("role") == "requester") {
    if (Meteor.user()) {
        $('#nickPickModal').modal('hide');
        // console.log('ONLINE');
        // console.log(Meteor.user().emails[0].address);
        // $.cookie("workerId", nick, {
        //     expires: 365
        // });
        if (Session.get("role") == "crowd") {
            Session.set("workerId", (gup("workerId") || Random.id()));
        } else {
            Session.set("workerId", Meteor.user().emails[0].address);
        }
    } else {
        // console.log('OFFLINE');
        // console.log(Meteor.user());
        delete Session.keys.workerId;

    }
});

// Utility functions
gup = function(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return unescape(results[1]);
};

scrollMessagesView = function() {
    return setTimeout(function() {
        return $("#messagesInner").scrollTop(10000);
    }, 200);
};

// alert for unread messages
$("#messageInput").on("blur", function() {
    return instachat.alertWhenUnreadMessages = true;
});

$("#messageInput").on("focus", function() {
    instachat.alertWhenUnreadMessages = false;
    hideMessageAlert();
    return instachat.unreadMessages = 0;
});

$(".memContainer").click(function() {
    console.log("inside here");
    $(".addBorder").removeClass("addBorder");
}).children().click(function(e) {
    e.stopPropagation();
});

showUnreadMessagesAlert = function() {
    if (instachat.messageAlertInterval) {
        return;
    }
    return instachat.messageAlertInterval = window.setInterval(function() {
        var msg, title;
        title = $("title");
        if (title.html() === "Chorus") {
            msg = instachat.unreadMessages === 1 ? "message" : "messages";
            return title.html(instachat.unreadMessages + " new " + msg + " - Chorus");
        } else {
            return title.html("Chorus");
        }
    }, 1000);
};

hideMessageAlert = function() {
    window.clearInterval(instachat.messageAlertInterval);
    instachat.messageAlertInterval = null;
    return window.setTimeout(function() {
        return $("title").html("Chorus");
    }, 1000);
};

unreadMessage = function(doc) {
    if (!(doc["nick"] === Session.get("workerId") || Session.get("mute"))) {
        // instachat.unreadMessageSound.play();
    }
    if (instachat.alertWhenUnreadMessages) {
        instachat.unreadMessages += 1;
        return showUnreadMessagesAlert();
    }
};

// Event Handlers
$("#mute").on("click", function() {
    if (Session.get("mute")) {
        $.cookie("mute", null);
    } else {
        $.cookie("mute", true, {
            expires: 365
        });
    }
    return Session.set("mute", $.cookie("mute"));
});

$(window).resize(function() {
    return $("#content").height($(window).height() - $("#content").offset.top - $("#footer").height());
});


function checkMessages() {
    $('.messageRow').each(function() {
        if (!$(this).hasClass('stale')) {
            if (parseInt($(this).attr('timestamp')) + staleTime < new Date().getTime()) {
                $(this).addClass('stale');
                $(this).children('.timestamp').addClass('stale');
                $(this).children('button').remove();
            }
        }
    });
}

reRankFacts = function() {
    var testJsonObj = {
        "test": {
            "email": "test@gmail.com",
            "password": "12345678"
        }
    };

    Meteor.call('reRankFacts', testJsonObj, function(error, response) {
        // console.log('client response');
        // console.log(response);
    });
}

// Timer callbacks

var shortTimerHandle = setInterval(function() {
    checkMessages();
}, 5000);



// Main //
$(document).ready(function() {
    $('.modal').on('hidden', function() {
        $(this).removeData();
    });
});

Meteor.startup(function() {
    reRankFacts();
    //console.log($(".isMsgImp"));

});
