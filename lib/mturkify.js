/**
*
*  gup(name) :: retrieves URL parameters if provided
*
*  Prepares the page for MTurk on load.
*  1. looks for a form element with id="mturk_form," and sets its METHOD / ACTION
*    1a. All that the task page needs to do is submit the form element when ready
*  2. disables form elements if HIT hasn't been accepted
*
**/

//  Turkify the task page.
mturkify = function () {
  // selector used by jquery to identify your form
  var form_selector = "#mturk_form";
  var assignId = gup("assignmentId");

  // check to see if assigntmentId is a URL parameter
  if(assignId != "" && assignId != "ASSIGNMENT_ID_NOT_AVAILABLE" && $(form_selector).length>0) {
    // console.log("assignmentId available. enabling form fields.");

    // Add a new hidden input element with name="assignmentId" that has assignmentId as its value.
    var assignId_input = $("<input type='hidden' name='assignmentId' value='" + assignId + "'>").appendTo($(form_selector));
    var workerId_input = $("<input type='hidden' name='workerId' value='" + gup("workerId") + "'>").appendTo($(form_selector));
    var hitId_input = $("<input type='hidden' name='hitId' value='" + gup("hitId") + "'>").appendTo($(form_selector));

    // Make sure the submit form's method is POST
    $(form_selector).attr('method', 'POST');

    // Set the Action of the form to the provided "turkSubmitTo" field
    if((submit_url=gup("turkSubmitTo"))!="") {
      $(form_selector).attr('action', submit_url + '/mturk/externalSubmit');
    }
  } else {
    $('input,textarea,select').attr("DISABLED", "disabled");
    $("#submitHIT").attr("DISABLED", "disabled");
  }
}
