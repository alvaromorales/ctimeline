var oldFillInfoBubble = Timeline.DefaultEventSource.Event.prototype.fillInfoBubble;
Timeline.DefaultEventSource.Event.prototype.fillInfoBubble = function(elmt, theme, labeller) {
    oldFillInfoBubble.call(this, elmt, theme, labeller);

    var eventObject = this;
    var eventObject_JSON = JSON.stringify(eventObject).replace(/&/, "&amp;").replace(/"/g, "&quot;");

    var event_id = eventObject.getDbId();
    this.current_event_id = event_id;

    var divCollab = document.createElement("div");
    divCollab.id = "eventBubble" + event_id;

    /*
    Edit event
    */
    var edit_html = "<a href='javascript:loadEventForEdit(" + eventObject_JSON + ")'>[edit event info]</a><p><br /></p>";

    /*
    Display event votes
    */

    var votes_id = "votes_" + event_id;
    var votes_html = "<span id='" + votes_id + "'>Votes: " + eventObject.getVotes() + " </span>" + "<a href='javascript:upvoteEvent(" + event_id + ")'>upvote</a>";

    /*
    Display event tags
    */

    var tags = eventObject.getTags();
    var tags_html = '';

    if (tags) {
        for (var i=0; i< tags.length;i++) {
            tag = tags[i];
            tags_html += "<li>" + tag + "</li>";
        }
    }

    var tags_div = "<p>Tags: </p><ul id=\"tagsBubble\"" + ">" + tags_html + "</ul>";
    var tags_json = JSON.stringify(eventObject.getTags());

    var collabHTML = edit_html+ votes_html + tags_div;
    divCollab.innerHTML = collabHTML;
    elmt.appendChild(divCollab);

    $("#tagsBubble").tagit({
        readOnly: true
    });

}

var upvoteEvent = function(event_id) {

	var bubbleObject = $("#eventBubble" + event_id);
	var data = {id : event_id};
	var voteUrl = "/timeline/vote";
	$.ajax({ 
		type:"GET", 
		url: voteUrl, 
		dataType: 'json', 
		data: data, 
		success: upvoteDone
	});

	return false;

}

var upvoteDone = function(response, status) {
	if (status == "success") {
		reloadTimeline(response);
	}
}

var reloadTimeline = function(events) {
    $(".timeline-message-container").css('display', 'block'); //display ajax spinner
    var eventSource = tl.getBand(0).getEventSource();

    eventSource.clear();

    eventSource.loadJSON(events, '');
    $(".timeline-message-container").css('display', 'none');  //hide ajax spinner
}


