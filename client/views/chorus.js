// var Messages, Tasks, Memory, gup, hideMessageAlert, instachat, scrollMessagesView, showUnreadMessagesAlert, unreadMessage;

// var accMessageID, staleMessageID;

// var MsgToDivMap, SnapShotsMap;

// var Ranks;
// //
// numSuccessfulMessages = 0;
// var MEMSNAPSHOTWINDOW = 10;


// Tasks = new Mongo.Collection("tasks");
// Messages = new Mongo.Collection("messages");
// Memory = new Mongo.Collection("memory");
// Ranks = new Mongo.Collection("ranks");
// MsgToDivMap = new Mongo.Collection("msgToDivMap");
// SnapShotsMap = new Mongo.Collection("snapShotsMap");

// // Params
// // var staleTime = 100000;
// var staleTime = 10000;

// // Collection Subscriptions
// Meteor.subscribe("tasks");
// Meteor.subscribe("msgToDivMap");
// Meteor.subscribe("ranks");

// // App startup
// Meteor.startup(function() {

//     instachat.unreadMessageSound = new Audio("/sound/Electro_-S_Bainbr-7955.wav");
//     $(window).resize();

//     var task_name = Session.get("task");
//     var task = Tasks.findOne({
//         task: task_name
//     });
//     if (!task) {
//         Tasks.insert({
//             name: task_name
//         });
//     }

//     scrollMessagesView();
//     $("#messageInput").select();

//     Session.set("role", (gup("role") || "crowd"));
//     Session.set("part", (gup("part") || "c"));
//     Session.set("task", (gup("task") || "testing"));
//     Session.set("assignmentId", (gup("assignmentId") || ""));
//     Session.set("hitId", (gup("hitId") || ""));
//     Session.set("turkSubmitTo", (gup("turkSubmitTo") || ""));
//     Session.set("min", (gup("min") || ""));

//     if (Session.get("role") === "requester") {
//         $('#nickPickModal').modal({
//             keyboard: false,
//             backdrop: "static"
//         });
//         $('#nickInput').focus(); // Focus on the modal's textbox
//     } else {
//         Session.set("workerId", (gup("workerId") || Random.id()));
//         var messageId = Random.id();

//         Meteor.call("newMessage", {
//             system: true,
//             body: Session.get("workerId") + " just joined the room.",
//             task: Session.get("task"),
//             role: Session.get("role"),
//             part: Session.get("part"),
//             msgId: messageId
//         });

//         history.pushState(null, null, "/tasks?role=" + Session.get("role") + "&part=" + Session.get("part") + "&task=" +
//             Session.get("task") + "&workerId=" + Session.get("workerId") + "&assignmentId=" +
//             Session.get("assignmentId") + "&hitId=" + Session.get("hitId") + "&turkSubmitTo=" +
//             Session.get("turkSubmitTo") + "&min=" + Session.get("min"));

//         $('#messageInput').focus();
//     }
// });

// // Globals
// instachat = {};
// instachat.alertWhenUnreadMessages = false;
// instachat.messageAlertInterval = null;
// instachat.unreadMessages = 0;

// Deps.autorun(function() {
//     var task_name, role;
//     task_name = Session.get("task");
//     if (task_name) {
//         return Meteor.subscribe(Session.get("role"), task_name);
//     }
// });

// Deps.autorun(function() {
//     return Meteor.subscribe("memory");
// });

// Deps.autorun(function() {
//     return Meteor.subscribe("ranks");
// });

// Deps.autorun(function() {
//     return Meteor.subscribe("messages");
// });

// Deps.autorun(function () {
//     return Meteor.subscribe("snapShotsMap");
// });

// Deps.autorun(function () {
//     return Messages.find({
//         "successful": true
//     }).observe({
//         added: function() {
//             numSuccessfulMessages++;
//         }
//     });

// });

// Deps.autorun(function() {
//     return Messages.find({
//         task: Session.get("task")
//     }).observe({
//         added: function(item) {
//             scrollMessagesView();
//             if (!item.system) {
//                 return unreadMessage(item);
//             }
//         }
//     });
// });

// Deps.autorun(function() {
//     if (Meteor.user()) {
//         $('#nickPickModal').modal('hide');
//         // console.log('ONLINE');
//         // console.log(Meteor.user().emails[0].address);
//         // $.cookie("workerId", nick, {
//         //     expires: 365
//         // });
//         Session.set("workerId", Meteor.user().emails[0].address);
//     } else {
//         // console.log('OFFLINE');
//         // console.log(Meteor.user());
//         delete Session.keys.workerId;

//     }
// });

// // Utility functions
// gup = function(name) {
//     name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
//     var regexS = "[\\?&]" + name + "=([^&#]*)";
//     var regex = new RegExp(regexS);
//     var results = regex.exec(window.location.href);
//     if (results == null)
//         return "";
//     else
//         return unescape(results[1]);
// };

// scrollMessagesView = function() {
//     return setTimeout(function() {
//         return $("#messagesInner").scrollTop(10000);
//     }, 200);
// };

// Template.messages.helpers({
//     messages: function() {
//         if (Session.get("part") == "m") {
//             // console.log("numSuccessfulMessages", numSuccessfulMessages);
//             // if ((numSuccessfulMessages % 10) == 0) {
//               return Messages.find({
//                   "successful": true
//                   // "role": "crowd",
//               }, {
//                   sort: {
//                       timestamp: -1
//                   },
//                   limit: MEMSNAPSHOTWINDOW
//               }).fetch().reverse();
//             // }
//         } else {
//             return Messages.find({}, {
//                 sort: {
//                     timestamp: 1
//                 }
//             });
//         }
//     },
//     memSnapShotFlag: function() {
//         return ((numSuccessfulMessages % 10) == 0);
//     },
//     memoryWorker: function() {
//         return Session.get("part") == "m";
//     },
//     pretty_ts: function(timestamp) {
//         var d, min;
//         if (!timestamp) {
//             return;
//         }
//         d = new Date(timestamp);
//         min = d.getMinutes();
//         min = min < 10 ? "0" + min : min;
//         return d.getHours() + ":" + min;
//     },
//     role: function() {
//         //todo: if message is successful display as it's class as if it were a requester's message to distinguish it as successful to workers
//         return this.role;
//     },
//     votable: function() {
//         return (Session.get("role") === "crowd" || Session.get("part") === "m") &&
//             this.role === "crowd" &&
//             Session.get("workerId") !== this.workerId &&
//             !this.successful;
//     },
//     voted: function() {
//         if (this.votedIds) {
//             var id = Session.get("workerId");
//             return this.votedIds.some(function(e) {
//                 return id === e;
//             }) ? (function() {
//                 return "unvote";
//             })() : (function() {
//                 return "vote";
//             })();
//         }
//         return "vote";
//     },
//     id: function() {
//         return this._id;
//     },
//     isStale: function(msgTime) {
//         return (new Date).getTime() > (msgTime + staleTime); // Classify prior messages older than 200s as stale
//     },
//     onlineCount: function() {
//         return Meteor.users.find({
//             "status.online": true
//         }).count()
//     },
//     cboxId: function() {
//         return Random.id();
//     },
//     staleMessageID: function() {
//         // staleMessageID = "staleMsg_".concat(this._id);
//         // return staleMessageID;
//         return this._id;
//     },
//     acceptedMessageID: function() {
//         // accMessageID = "acceptedMsg_".concat(this._id);
//         // return accMessageID;
//         return this._id;
//     },
//     unacceptedMessageID: function() {
//         // return "unaccMsg_".concat(this._id);
//         return this._id;
//     },
//     chatOrRequester: function() {
//         return ((Session.get("part") == "c") || (Session.get("role") == "requester"));
//     },
//     chatWorker: function() {
//         return (Session.get("part") == "c");
//     },
//     memoryWorker: function() {
//         return (Session.get("part") == "m");
//     },
//     requester: function() {
//         return (Session.get("role") == "requester");
//     }
// });




// Template.messages.events = {
//     "click button": function(e, template) {
//         Meteor.call($(e.currentTarget).val(), [this._id, Session.get("workerId")]);
//     }
//     // ,
//     // "click .makeClickable": function (e, template) {
//     //     // if ( (e.currentTarget.id.indexOf("stale") > -1) || (e.currentTarget.id.indexOf("accepted") > -1) ) {
//     //     //   // if we are in this function, that means a message was clicked on
//     //     //   // we should show the message and ask why this was important
//     //     //   console.log(e.currentTarget.id);
//     //     //   $("#".concat(e.currentTarget.id)).css("background-color", "yellow");
//     //     //
//     //     // }
//     //
//     //     console.log(e.currentTarget.id);
//     //
//     //     $("#".concat(e.currentTarget.id)).css("background-color", "yellow");
//     //
//     // }
// };

// Template.messagesForMemory.events = {
//     "click .makeClickable": function(e, template) {
//         // console.log("clicked on ".concat(e.currentTarget.id));
//         // debugger;
//         // $("#".concat(e.currentTarget.id)).css("background-color", "yellow");
//         $("#".concat(e.currentTarget.id)).toggleClass("clickedOn");

//     }

// };

// Template.memory.events = {
//     "click .makeClickable": function(e, template) {
//         e.preventDefault();
//         // var TIME_TO_FADE = 3000;
//         var typeOfWorker = Session.get("part");
//         var elemId = e.currentTarget.id;
//         // console.log("clicked on " + elemId);

//         $(".addBorder").removeClass("addBorder");
//         $("#".concat(elemId)).addClass("addBorder");

//         var memoryText = "";
//         if (typeOfWorker == "c") {
//             memoryText = $.trim($("#".concat(elemId)).text().trim());
//         } else if (typeOfWorker == "m") {
//             memoryText = $("#".concat(elemId)).find(".btn").attr("value");
//         }

//         // console.log("memorytext is: " + memoryText);
//         // console.log(elemId);

//         var memoryItem = Memory.find({
//             memWhy: memoryText
//         }).fetch();
//         var msgIdsForMemoryItem = [];

//         memoryItem.forEach(function(item) {
//             msgIdsForMemoryItem = item.memMsgIds;
//             //console.log(msgIdsForMemoryItem);
//         });

//         // once we have the messages, we want to scroll back up ONLY IF we are a crowd chat worker
//         // if we are a crowd memory worker, then we will just open an accordion with the messages in this memory item

//         $(".msgDiv").removeClass("clickedOn");
//         if (typeOfWorker == "c") {
//             // highlight all the messages
//             // for each of the message ids linked to the memory, find the corresponding div and toggle its class
//             var divId;
//             for (var i = 0; i < msgIdsForMemoryItem.length; i++) {
//                 // console.log(msgIdsForMemoryItem[i]);

//                 var mappingObj = MsgToDivMap.findOne({
//                     messageId: msgIdsForMemoryItem[i]
//                 });
//                 divId = mappingObj.divId;
//                 // console.log(divId);

//                 $("#".concat(divId)).addClass("clickedOn");
//                 // setTimeout(function () {
//                 //   for (var i = 0; i < msgIdsForMemoryItem.length; i++) {
//                 //       $("#".concat(msgIdsForMemoryItem[i])).removeClass("clickedOn");
//                 //   };
//                 // }, TIME_TO_FADE);

//             };

//             // scroll to message(s) if needed (if there's a message that's out of view, add a button to scroll up)
//             // get the one that's furthest away
//             var furthestAway = $("#".concat(divId)).position().top;
//             for (var i = 0; i < msgIdsForMemoryItem.length; i++) {
//                 var distance = $("#".concat(divId)).position().top;
//                 //console.log("distance is: " + distance + " and furthestAway is: " + furthestAway);
//                 if (distance < furthestAway) {
//                     furthestAway = distance;
//                 }
//             }
//             $("#messagesInner").scrollTop($("#messagesInner").scrollTop() + furthestAway);
//         }
//     },
//     "click .collapseMsgListBtn": function(e, template) {
//         e.preventDefault();

//         // console.log("inside the collapseMsgListBtn");

//         var elemId = e.currentTarget.id;
//         // console.log(elemId);
//         var dialogId = elemId + "_dialog";
//         // console.log(dialogId);

//         // only create the element if it doesn't exist
//         var elemExistsFlag = document.getElementById(dialogId);
//         // console.log(elemExistsFlag);

//         if (!elemExistsFlag) {
//             // var memoryText = $("#".concat(elemId)).attr("value");
//             var memoryText = $("#".concat(elemId)).text().trim();

//             // console.log("memorytext is: " + memoryText);
//             // console.log(elemId);

//             var memoryItem = Memory.find({
//                 memWhy: memoryText
//             }).fetch();
//             // console.log(memoryItem);
//             var msgIdsForMemoryItem = [];

//             memoryItem.forEach(function(item) {
//                 msgIdsForMemoryItem = item.memMsgIds;
//                 // console.log(msgIdsForMemoryItem);
//             });

//             // console.log("element doesnt exist");
//             // console.log(msgIdsForMemoryItem);
//             str = "<div id='" + dialogId + "'>";
//           for (var i = 0; i < msgIdsForMemoryItem.length; i++) {
//             // for each id, go to the Messages collection and get the corresponding text
//             // console.log(msgIdsForMemoryItem.length);
//             var message = Messages.findOne({
//               msgId: msgIdsForMemoryItem[i]
//             });
//             // console.log(message);
//             // console.log(message);
//             var userOrCrowd = "";
//             if (message.role === "crowd") {
//               userOrCrowd = "Crowd: ";
//             } else {
//               userOrCrowd = "User: ";
//             }

//             str += "<p style='width:90%;' class='collMsgList collapseMsgList_" + dialogId + "'> --> " + userOrCrowd + " " + message.body + "</p>";
//           }
//           str += " </div>";

//           $("#".concat(elemId)).after(str);
//           $("#".concat(dialogId)).addClass("addBorder");
//           $(".collapseMsgList_".concat(dialogId)).slideDown();
//         }
//         else {
//           // console.log("element does exist");
//           $("#".concat(dialogId)).toggleClass("addBorder");
//           $(".collapseMsgList_".concat(dialogId)).slideToggle();
//         }
//     },
//     "click input[type=radio]": function(e, template) {
//         // e.preventDefault();
//         e.stopImmediatePropagation();
//         // var elemId = $("input[type=radio][name^=likert_]:checked").attr("id");
//         var elem = e.currentTarget.id;
//         // console.log(elem);
//         var radioVal = elem.split("_")[0];
//         var radioId = elem.split("_")[1];
//         //console.log("memory elem is: " + radioId + " and value is: " + radioVal);

//         //RANKING ADD/UPDATE
//         // check to see if this memoryId already has rankings in the collection
//         var messageList = [];
//         var i = 0;
//         $("#messagesInner").children(".msgDiv").each(function(k, v) {
//             messageList[i] = this.id;
//             i++;
//         });

//         // console.log(messageList);
//         // debugger;

//         // var memRankObj = Ranks.find({
//         //     memoryId: radioId
//         // }).fetch();
//         //
//         // if ($.isEmptyObject(memRankObj)) {
//         //     // add to the collection
//         //     Meteor.call("addRanks", {
//         //         memId: radioId,
//         //         counter_1: 0,
//         //         counter_2: 0,
//         //         counter_3: 0,
//         //         snapShots: messageList
//         //     });
//         // }

//         // UPDATE THE SNAPSHOTS map



//         // update the counter
//         // Meteor.call("updateRanks", {
//         //     memId: radioId,
//         //     counterToUpdate: radioVal,
//         //     snapShots: messageList
//         // });

//         // remove that list group
//         $("#likertListGroup_".concat(radioId)).hide();

//         // #####################################################################
//         // #####################################################################
//         // #####################################################################
//         //
//         // var data = [[0,1],[32, 67], [12, 79]];
//         // var result = regression('linear', data);
//         // console.log("result is: " + result);
//         // debugger;

//         // // get a list of all the memory ids and their counts
//         // var allMemItems = Ranks.find({}, {});
//         // var count = 0;
//         // var memItemIds = [];
//         // var memItemRanks = [];
//         // allMemItems.forEach(function(memItem) {
//         //     memItemIds[count] = memItem.memoryId;
//         //     memItemRanks[count] = [memItem.counter_1, memItem.counter_2 + memItem.counter_3];
//         //     count++;
//         // });

//     }
// };

// Template.memoryInput.events = {

//   "click .addtoMem": function(e) {
//       e.preventDefault();
//       $('#memInfoModal').modal({
//           // keyboard: false,
//           // backdrop: "static"
//       });
//       $('#memInput').focus(); // Focus on the modal's textbox
//   }

// };

// Template.memory.helpers({
//     memoryId: function() {
//         return this._id;
//     },
//     requester: function() {
//         return (Session.get("role") == "requester");
//     },
//     toggleMessagesId: function() {
//         return this._id;
//     },
//     memory: function() {
//         return Memory.find({}, {
//             sort: {
//                 timestamp: 1
//             }
//         });
//     },
//     memoryWorker: function() {
//         // console.log("role is ".concat(Session.get("role")));
//         return (Session.get("part") == "m");
//     }
// });

// Template.messagesInput.helpers({
//     chatOrRequester: function() {
//         return ((Session.get("part") == "c") || (Session.get("role") == "requester"));
//     },
//     chatWorker: function() {
//         return (Session.get("part") == "c");
//     },
//     requester: function() {
//         return (Session.get("role") == "requester");
//     }
// });

// Template.muteButton.helpers({
//     volumeIcon: function() {
//         if (Session.get("mute")) {
//             return "icon-volume-off";
//         } else {
//             return "icon-volume-up";
//         }
//     }
// });

// Template.messagesForMemory.helpers({
//     memMsgId: function() {
//         return ("memMsg_".concat(this._id));
//     },
//     msgsForMemory: function() {
//         // show the last N messages, but when it comes to displaying, display in reverse order (so most recent message will be at the bottom)
//         return Messages.find({
//             "successful": true
//             // "role": "crowd",
//         }, {
//             sort: {
//                 timestamp: -1
//             },
//             limit: MEMSNAPSHOTWINDOW
//         }).fetch().reverse();

//     },
//     pretty_ts: function(timestamp) {
//         var d, min;
//         if (!timestamp) {
//             return;
//         }
//         d = new Date(timestamp);
//         min = d.getMinutes();
//         min = min < 10 ? "0" + min : min;
//         return d.getHours() + ":" + min;
//     },
//     memSnapShotFlag: function() {
//         return ((numSuccessfulMessages % MEMSNAPSHOTWINDOW) == 0);
//     }
// });

// // alert for unread messages
// $("#messageInput").on("blur", function() {
//     return instachat.alertWhenUnreadMessages = true;
// });

// $("#messageInput").on("focus", function() {
//     instachat.alertWhenUnreadMessages = false;
//     hideMessageAlert();
//     return instachat.unreadMessages = 0;
// });

// $(".memContainer").click(function() {
//     console.log("inside here");
//     $(".addBorder").removeClass("addBorder");
// }).children().click(function(e) {
//     e.stopPropagation();
// });

// showUnreadMessagesAlert = function() {
//     if (instachat.messageAlertInterval) {
//         return;
//     }
//     return instachat.messageAlertInterval = window.setInterval(function() {
//         var msg, title;
//         title = $("title");
//         if (title.html() === "Chorus") {
//             msg = instachat.unreadMessages === 1 ? "message" : "messages";
//             return title.html(instachat.unreadMessages + " new " + msg + " - Chorus");
//         } else {
//             return title.html("Chorus");
//         }
//     }, 1000);
// };

// hideMessageAlert = function() {
//     window.clearInterval(instachat.messageAlertInterval);
//     instachat.messageAlertInterval = null;
//     return window.setTimeout(function() {
//         return $("title").html("Chorus");
//     }, 1000);
// };

// unreadMessage = function(doc) {
//     if (!(doc["nick"] === Session.get("workerId") || Session.get("mute"))) {
//         instachat.unreadMessageSound.play();
//     }
//     if (instachat.alertWhenUnreadMessages) {
//         instachat.unreadMessages += 1;
//         return showUnreadMessagesAlert();
//     }
// };

// // Event Handlers
// $("#mute").on("click", function() {
//     if (Session.get("mute")) {
//         $.cookie("mute", null);
//     } else {
//         $.cookie("mute", true, {
//             expires: 365
//         });
//     }
//     return Session.set("mute", $.cookie("mute"));
// });

// $(window).resize(function() {
//     return $("#content").height($(window).height() - $("#content").offset().top - $("#footer").height());
// });

// Template.messagesInput.events({
//     "submit #messageForm": function(event) {
//         event.preventDefault();
//         var $message, message;
//         var messageId = Random.id();

//         $message = event.target.messageInput.value.trim();
//         console.log($message);
//         event.target.messageInput.value = "";

//         if ($message) {
//             Meteor.call('newMessage', {
//                 workerId: Session.get("workerId"),
//                 body: $message,
//                 task: Session.get("task"),
//                 role: Session.get("role"),
//                 part: Session.get("part"),
//                 msgId: messageId
//                 // timestamp is added on the server side
//             });
//         }
//     }
// });

// Template.memoryInput.helpers({
//     memoryWorker: function() {
//         return (Session.get("part") == "m");
//     }
// });

// Template.memModal.events({
//     "click .heresWhy": function(event, template) {
//         event.preventDefault();
//         // console.log("inside mem modal saving");
//         var $warning, $memModalTxtBox, whyImp;
//         // $warning = $(this).find(".warning");
//         $warning = template.find(".warning");
//         // $memModalTxtBox = $(this).find(".memModalTxtBox");
//         $memModalTxtBox = template.find(".memModalTxtBox");
//         whyImp = $("#memInput").val().replace(/^\s+|\s+$/g, "");
//         // reset text
//         $($warning).text("").html();
//         $($memModalTxtBox).val("");

//         var msgIdsArray = [];
//         var idx;

//         // get a list of all divs with the clickedOn class
//         // then get their IDs
//         idx = 0;
//         $(".clickedOn").each(function(index, element) {

//             // take the content inside the div, then find the message in the Messages collection
//             // then get the ID from that record and save it
//             // console.log(this.id);
//             var messageText = $("#".concat(this.id)).text().trim().split(":-")[1].slice(1); // the ":-" is our special recognition character pattern
//             var wId = $("#".concat(this.id)).text().trim().split(":")[1].split(":-")[0].slice(3); // get the part between the time stamp and the special chars
//             var time = $("#".concat(this.id)).find(".memoryRow").attr("timestamp");
//             var tStamp = new Date(Number(time));
//             tStamp = tStamp.getTime();

//             // console.log(messageText);
//             // console.log(wId);
//             // console.log(tStamp);

//             // console.log(Messages.find({}).fetch());

//             var messageItem = Messages.findOne({
//                 body: messageText,
//                 workerId: wId,
//                 timestamp: tStamp
//             });

//             // console.log(messageItem);
//             // console.log((this.id).split("_")[1]);
//             // // console.log(messageItem.msgId);

//             msgIdsArray[idx] = messageItem.msgId;
//             // console.log(msgIdsArray[idx]);

//             // console.log("updating msgDivMap");
//             // update the Div to Message map
//             Meteor.call("updateMsgDivMap", {
//                 messageId: messageItem.msgId,
//                 divId: (this.id).split("_")[1]
//             });

//             idx++;
//         });

//         if (!whyImp && (msgIdsArray.length > 0)) {
//             $($warning).text("Please add a description of why these messages are important!").html();
//         } else if (msgIdsArray.length == 0) {
//             $($warning).text("Please select at least one message!").html();
//         } else {
//             // console.log("adding fact to mem collection");
//             //add the message ID, along with the justification, to the memory
//             Meteor.call("newMemory", {
//                 memWhy: whyImp,
//                 memMsgIds: msgIdsArray
//             });

//             // cleanup
//             $(".makeClickable").removeClass("clickedOn");
//             $('#memInfoModal').modal('hide');

//         }

//         // history.pushState(null, null, "/tasks?role=" + Session.get("role") + "&part=" + Session.get("part") + "&task=" +
//         //     Session.get("task") + "&workerId=" + Session.get("workerId") + "&assignmentId=" + Session.get("assignmentId") +
//         //     "&hitId=" + Session.get("hitId") + "&turkSubmitTo=" + Session.get("turkSubmitTo") + "&min=" +
//         //     Session.get("min"));
//         // hideMessageAlert();

//         $('#messageInput').focus();
//     }
// });

// Template.body.helpers({
//     partOfChorus: function() {
//         if (Session.get("part") == "c" && Session.get("role") == "crowd") {
//             return ": Conversation Portal";
//         }

//         if (Session.get("part") == "m" && Session.get("role") == "crowd") {
//             return ": Memory Curation Portal";
//         }

//         if (Session.get("role") == "requester") {
//             return ": User Portal";
//         }
//     }
// });

// Template.nickModal.helpers({
//     requester: function() {
//         return (Session.get("role") == "requester");
//     }
// });

// Template.nickModal.events({
//     'keypress input': function(event) {
//         if (event.charCode == 13) {
//             event.stopPropagation();
//             $('#login-buttons-password').trigger('click');
//             return false;
//         }
//     }
//     // "submit #nickPick": function(event) {
//     //     event.preventDefault();
//     //     var $warning, nick;
//     //     $warning = $(this).find(".warning");
//     //     nick = event.target.nickInput.value.replace(/^\s+|\s+$/g, "");
//     //     $warning.html("");
//     //     if (!nick || nick.length > 20) {
//     //         $warning.html("Your nickname must be between 1 and 20 characters long!");
//     //     } else {
//     //         $.cookie("workerId", nick, {
//     //             expires: 365
//     //         });
//     //         Session.set("workerId", nick);
//     //         $('#nickPickModal').modal('hide');
//     //     }
//     //     $('#messageInput').focus();
//     // }
// });

// Template.muteButton.events({
//     "click #login-buttons-logout": function(event) {
//         location.reload();
//     }
// });

// function checkMessages() {
//     $('.messageRow').each(function() {
//         if (!$(this).hasClass('stale')) {
//             if (parseInt($(this).attr('timestamp')) + staleTime < new Date().getTime()) {
//                 $(this).addClass('stale');
//                 $(this).children('.timestamp').addClass('stale');
//                 $(this).children('button').remove();
//             }
//         }
//     });
// }

// reRankFacts = function() {
//     var testJsonObj = {
//         "test": {
//             "email": "test@gmail.com",
//             "password": "12345678"
//         }
//     };

//     Meteor.call('reRankFacts', testJsonObj, function(error, response) {
//         console.log('client response');
//         console.log(response);
//     });
// }

// // Timer callbacks

// var shortTimerHandle = setInterval(function() {
//     checkMessages();
// }, 5000);



// // Main //
// $(document).ready(function() {
//     $('.modal').on('hidden', function() {
//         $(this).removeData();
//     });
// });

// Meteor.startup(function() {
//     reRankFacts();
//     //console.log($(".isMsgImp"));

// });