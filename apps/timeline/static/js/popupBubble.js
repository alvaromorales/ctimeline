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

    for (var i=0; i< tags.length;i++) {
        tag = tags[i];
        tags_html += "<label class=\"label label-info tag\">" + tag + "</label>";
    }

    var tags_div = "<p>Tags: </p><div id=\"tagsDetail" + event_id + "\" class=\"tag-box-small\">" + tags_html + "</div>";

    var tags_json = JSON.stringify(eventObject.getTags());
    var tags_edit_html = "<a href='javascript:loadTagsForEdit(" + tags_json + "," + event_id + ")'>Edit tags</a>";

    var collabHTML = edit_html+ votes_html + tags_div + tags_edit_html;

    divCollab.innerHTML = collabHTML;

    divCollab.firstChild.onclick = function() {
        //$(this).hide();
    }
    elmt.appendChild(divCollab);
}

function upvoteEvent(event_id) {

	var bubbleObject = $("#eventBubble" + event_id);
	var data = {id : event_id};
	var voteUrl = "/vote";
	$.ajax({ 
		type:"GET", 
		url: voteUrl, 
		dataType: 'json', 
		data: data, 
		success: upvoteDone
	});

	return false;

}

function upvoteDone(response, status) {
	if (status == "success") {
		reloadTimeline(response);
	}
}

function reloadTimeline(events) {

    $(".timeline-message-container").css('display', 'block'); //display ajax spinner
    var eventSource = tl.getBand(0).getEventSource();

    eventSource.clear();

    eventSource.loadJSON(events, '');
    $(".timeline-message-container").css('display', 'none');  //hide ajax spinner
}


