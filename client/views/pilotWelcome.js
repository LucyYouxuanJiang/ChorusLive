Meteor.startup(function() {
  
});

// If the participant submits the correct answer, the system will direct them to tutorial interface for practicing.
Template.tutorialOne.events({
  'submit form' : function(event){
  	event.preventDefault();
  	var answer = event.target.answer.value;
  	if (answer == "right"){
  	  alert("Right answer! Now you are ready to give it a try!");
  	  Router.go('/chatTutorial'); // This needs to be changed to the corresponding tutorial interface branch.
  	} else {
  	  alert("Wrong answer! Please watch the video and try it again.");
  	}
  }
});
