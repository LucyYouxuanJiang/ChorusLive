// Params
maxCount = 150;

// numSuccessfulMessages = 0;

// Messages - {message:    String
//             username:   String
//             task:       String
//             created_at: Number}
Meteor.publish("tasks", function() {
    return Tasks.find({});
});

// Messages = new Mongo.Collection("messages");

Meteor.publish("messages", function() {
    return Messages.find({
        // session: session,
        role: {
            $in: ["crowd", "requester", "memTutorial"]
        }
    }, {

    });
});

Meteor.publish("admin", function(session) {
    return Messages.find({
        session: session,
        role: {
            $in: ["admin", "crowd", "requester"]
        }
    }, {
        sort: {
            timestamp: -1
        },
        limit: maxCount
    });
});

Meteor.publish("crowd", function(session) {
    return Messages.find({
        session: session,
        role: {
            $in: ["crowd", "requester"]
        }
    }, {
        sort: {
            timestamp: -1
        },
        limit: maxCount
    });
});

Meteor.publish("requester", function(session) {
    return Messages.find({
        $or: [{
            session: session,
            role: "requester"
        }, {
            successful: true
        }]
    }, {
        sort: {
            timestamp: -1
        },
        limit: maxCount
    });
});

// add the collection for memory items
// Memory = new Mongo.Collection("memory");

Meteor.publish("memory", function() {
    return Memory.find({}, {
        sort: {
            createdAt: -1
        }
    });
});

// Meteor.publish("msgSnapShot", function() {
//      console.log("Num successful", numSuccessfulMessages);
//     // if ((numSuccessfulMessages % 10) == 0) {
//       return Messages.find({
//           "successful": true
//           // "role": "crowd",
//       }, {
//           sort: {
//               timestamp: -1
//           },
//           limit: 10
//       });
//     // }
// });


// Ranks = new Mongo.Collection("ranks");

Meteor.publish("ranks", function() {
    return Ranks.find({}, {
        // return the 7 top memory items
        // sort:
    });
});

// MsgToDivMap = new Mongo.Collection("msgToDivMap");

Meteor.publish("msgToDivMap", function() {
    return MsgToDivMap.find({}, {

    });
});

// SnapShotsMap = new Mongo.Collection("snapShotsMap");

Meteor.publish("snapShotsMap", function() {
    return SnapShotsMap.find({}, {

    });
});


Meteor.publish("simpleChatMessages", function() {
    return simpleChatMessages.find({});
});

Meteor.publish("memDataCollectionMode", function() {
    return MemDataCollectionMode.find({});
});

Meteor.methods({
    newMessageSimpleChat: function(args) {
        var newMsg;
        newMsg = {};
        newMsg["body"] = args.body;
        newMsg["msgId"] = args.msgId;

        newMsg["user_id"] = args.user_id;
        newMsg["name"] = Meteor.user().emails[0].address;
        newMsg["session"] = args.session;
        newMsg["pm"] = args.pm;
        newMsg["timestamp"] = new Date().getTime();

        console.log(newMsg);
        simpleChatMessages.insert(newMsg);

        return true;
    },
    newMessage: function(args) {
        // console.log(args);
        // console.log(Messages.find({}).fetch());
        // console.log('numMsgs', numSuccessfulMessages);
        var newMsg;
        newMsg = {};
        newMsg["body"] = args.body;
        if (args.workerId) {
            newMsg["workerId"] = args.workerId;
        }
        if (args.system) {
            newMsg["system"] = args.system;
        }

        if ((args.role === "crowd") && (args.part === "c") && (args.system !== true)) {
            newMsg["voteThreshold"] = (function() {
                // var observers = MongoInternals.RemoteCollectionDriver.mongo._liveResultsSets['{"ordered":false,"collectionName":"messages","selector":{"task":"' + args.task +  '","role":{"$in":["crowd","requester"]}},"options":{"transform":null,"sort":{"timestamp":-1},"limit":150}}']._observeHandles;

                // We need to count how many CHAT WORKERS there are. If we have less than three, have everyone's messages be accepted.
                // only look in the past 150 messages
                // TODO: is this a correct interpretation of the deprecated code above?? UNLESS: it's a threshold PER user?
                var chatWorkers = Messages.find({
                    session: args.session,
                    part: args.part,
                    session: args.session
                }, {
                    fields: {
                        "workerId": 1,
                        "_id": 0
                    },
                    sort: {
                        timestamp: -1
                    },
                    limit: 100
                }).fetch();
                // console.log(args.task);
                // console.log(args.part);
                // console.log(chatWorkerCount);
                // console.log(Messages.find({}).fetch());
                // console.log(Messages.find({task: args.task, part:args.part}, {fields: {"workerId": 1}}).fetch());
                // console.log(chatWorkerCount);

                // console.log(chatWorkers);
                function uniqueWorkers(arr) {
                    var n = {},
                        r = [];

                    for (i = 0; i < arr.length; i++) {
                        var item = arr[i];
                        item = item.workerId;
                        if (!n[item]) {
                            n[item] = true;
                            r.push(item);
                        }
                    }
                    return r;
                };
                chatWorkerCount = Object.keys(uniqueWorkers(chatWorkers)).length;
                // console.log(chatWorkerCount);

                // var observers = {};
                // var count = Object.keys(observers).length;

                // TODO: There could be a race condition w/this logic where two (or more) workers can add at the same time??
                if (chatWorkerCount == 0) {
                    // this means this is the very first chat person and very first chat message, so artificially increase count by one
                    chatWorkerCount++;
                }
                if (chatWorkerCount < 3) {
                    // numSuccessfulMessages++;

                    Messages.update(args.id, {
                        $set: {
                            successful: true
                        }
                    });
                    newMsg["successful"] = true;
                }
                console.log('NUM_CHAT_WORKERS: ', chatWorkerCount, 'VOTING THRESHOLD: ', chatWorkerCount / 3);
                return chatWorkerCount / 3;
            })(); // this function thing is an IEFE

            newMsg["votedIds"] = [args.workerId];
            newMsg["votes"] = 1;
            newMsg["part"] = args.part;

        }

        newMsg["timestamp"] = new Date().getTime();

        newMsg["role"] = args.role;
        if (args.role == "requester" || args.role == "memTutorial") {
            // numSuccessfulMessages++;

            newMsg["successful"] = true;
        }

        newMsg["msgId"] = args.msgId;

        newMsg["user_id"] = args.user_id;
        newMsg["session"] = args.session;

        Messages.insert(newMsg);

        return true;
    },
    newMemory: function(args) {
        var newMemItem;
        newMemItem = {};
        if (args.memMsgIds) {
            newMemItem["memMsgIds"] = args.memMsgIds;
        }
        if (args.memWhy) {
            newMemItem["memWhy"] = args.memWhy;
        }
        newMemItem["createdAt"] = new Date();
        newMemItem["workerId"] = args.workerId;
        newMemItem['session'] = args.session;

        // if we don't have live update, that means we are doing a (pre)study, so we will save to a different collection
        if (args.liveUpdate == "n") {
          MemDataCollectionMode.insert(newMemItem);
        } else {
          Memory.insert(newMemItem);
        }
        // console.log(newMemItem);
        return true;
    },
    addRanks: function(args) {
        var newRankObj = {};
        newRankObj["memoryId"] = args.memId;
        newRankObj["counter_1"] = args.counter_1;
        newRankObj["counter_2"] = args.counter_2;
        newRankObj["counter_3"] = args.counter_3;

        var snapshotsArr = new Array();
        snapshotsArr.push(args.msgSnapShot);
        newRankObj["snapShots"] = snapshotsArr;

        Ranks.insert(newRankObj);

        // console.log("added new: ");
        // console.log(newRankObj);
    },
    updateRanks: function(args) {
        var counterToUpdate = args.counterToUpdate;
        var memId = args.memId;

        if (counterToUpdate == 1) {
            Ranks.update({
                memoryId: memId
            }, {
                $inc: {
                    counter_1: 1
                }
            });
        } else if (counterToUpdate == 2) {
            Ranks.update({
                memoryId: memId
            }, {
                $inc: {
                    counter_2: 1
                }
            });
        } else if (counterToUpdate == 3) {
            var rankObj = Ranks.findOne({
                memoryId: memId
            });
            var snapshotsArr = rankObj.msgList;
            snapshotsArr.push(args.msgList);

            Ranks.update({
                memoryId: memId
            }, {
                $inc: {
                    counter_3: 1
                },
                $set: {
                    snapShots: snapshotsArr
                }
            });
        }

        // console.log("counterToUpdate is: " + counterToUpdate);
        console.log(Ranks.find({
            memoryId: memId
        }).fetch());

    },
    updateMsgDivMap: function(args) {
        var mappingObj = {};
        mappingObj["messageId"] = args.messageId;
        mappingObj["divId"] = args.divId;
        MsgToDivMap.insert(mappingObj);

    },
    updateSnapShotsMap: function(args) {
        var mappingObj = {};
        mappingObj["snapShotId"] = args.snapShotId;
        mappingObj["messageList"] = args.msgList;
        SnapShotsMap.insert(mappingObj);
    },
    vote: function(params) {
        var id = params[0];
        var workerId = params[1];
        var message = Messages.findOne(id);

        Messages.update(id, {
            $inc: {
                votes: 1
            },
            $addToSet: {
                votedIds: workerId
            }
        });

        if (message.votes >= (message.voteThreshold)) {
            // numSuccessfulMessages++;

            Messages.update(id, {
                $set: {
                    successful: true
                }
            });
            // TODO: show 'accepted'
        }
    },
    unvote: function(params) {
        var id = params[0];
        var workerId = params[1];
        var message = Messages.findOne(id);
        if (!message.successful) {
            Messages.update(id, {
                $inc: {
                    votes: -1
                },
                $pull: {
                    votedIds: workerId
                }
            });
        }
    },
    reRankFacts: function(testJsonObj) {
        // console.log('server');
        // console.log(testJsonObj);
        return HTTP.call("GET", "http://jsonplaceholder.typicode.com/posts/1", {
            data: {
                test: testJsonObj
            }
        });
    },
    exportJSON: function(obj) {
        console.log(obj.session);
        console.log(obj.pm);
        console.log(obj.userId);
        var exportData = null;

        if (obj.pm == 'true') {
            exportData = simpleChatMessages.find({
                $or: [{
                    $and: [{
                        session: obj.session
                    }, {
                        user_id: obj.userId
                    }, {
                        pm: 'true'
                    }]
                }, {
                    $and: [{
                        session: obj.userId
                    }, {
                        user_id: obj.session
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
            exportData = simpleChatMessages.find({
                $and: [{
                    session: obj.session
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
        var exportDataJSON = {};
        exportDataJSON.data = [];
        exportData.forEach(function(doc) {
            exportDataJSON.data.push({
                user: doc.name,
                message: doc.body
            });
        });

        console.log(JSON.stringify(exportDataJSON));
        var newJSON = obj.session + '-' + new Date().getTime() + '.json';
        fs.writeFile(__meteor_bootstrap__.serverDir + '/../web.browser/app/convos/exports/' + newJSON, JSON.stringify(exportDataJSON), function(err) {
            if (err) return console.log(err);
            console.log(newJSON + '.json created.');
        });

        return newJSON;
    },
    readJsonFile: function(part, session, role) {
        if (!part || !session || !role) return;

        var file = session + '.json';
        // var data = fs.readFileSync(__ROOT_APP_PATH__ + '/../../../../../public/convos/' + file, 'utf8', function(err, data) {
        // var data = fs.readFileSync('./convos/' + file, 'utf8', function(err, data) {
        var data = fs.readFileSync(__meteor_bootstrap__.serverDir + "/../web.browser/app/convos/" + file, 'utf8', function(err, data) {
            return data;
        });
        // var data = fs.readFileSync('/convos/' + file, 'utf8', function(err, data) {
        //     return data;
        // });
        return data;
    }
});

Meteor.startup(function() {

    fs = Npm.require('fs');

    __ROOT_APP_PATH__ = fs.realpathSync('.');
    console.log(__ROOT_APP_PATH__);

    process.env.HTTP_FORWARDED_COUNT = 0;
    // remove all update/remove access from the client
    return _.each(["Tasks", "Messages", "Memory", "MsgToDivMap", "Ranks", "SnapShotsMap", "simpleChatMessages", "MemDataCollectionMode"], function(collection) {
        return _.each(["update", "remove"], function(method) {
            return Meteor.default_server.method_handlers["/" + collection + "/" + method] = function() {};
        });
    });
});
