Router.route('/tasks', function() {
    var params = this.params.query;
    if (params.role == 'requester') {
        this.next();
        this.layout('requester');
    } else {
        this.next();
        if (params.part == 'c')
            this.layout('chatWorker');
        else
            this.layout('memory');
    }
});

Router.route('/tutorial', function() {
    var params = this.params.query;
    this.next();
    if (params.part == 'c') {
        this.layout('chatTutorial');
    } else {
        this.layout('memoryTutorial');
    }
});

// My welcome page for pilot study with instructions
Router.route('/pilotWelcome', function(){
    var params = this.params.query;
    this.next();
    this.layout('pilotWelcome');

});

Router.route('/showData', function() {
    this.layout("showConvoData");
});

//================================SIMPLE CHAT APP ROUTES==================================

Router.route('/simpleChatLogin', function() {
    if (Meteor.userId()) {
        Router.go('chat', {}, {
            query: 'session=&pm=false'
        });
        // this.next();
    } else {
        this.layout('nickModalSimpleChat');
        // this.next();
    }
});


Router.route('/chat', function() {
    if (!Meteor.userId()) {
        Router.go('simpleChatLogin');
    }
    // Session.set('mode', 'chatroom');
    this.layout('simpleChat');
});