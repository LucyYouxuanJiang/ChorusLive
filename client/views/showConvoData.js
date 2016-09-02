Template.messagesDataView.helpers({
  messages: function() {
      return Messages.find({
          $or: [{
              session: gup("session")
          }, {
              user_id: gup("session")
          }]
      }, {
          $sort: {
              'timestamp': -1
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
  }
});

function gup(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return unescape(results[1]);
};

Template.registerHelper('isEqual', function (a, b) {
     return a === b;
   });
