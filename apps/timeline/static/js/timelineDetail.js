var tags = {};
var tags_current = {};

var filter_tags = {};
var selected_tags = 0;

var tags_editing_mode = false;
var event_editing_mode = false;

var current_event_id;

$(document).ready(function() {

	//load timeline
	(function() {
		var eventSource = new Timeline.DefaultEventSource();
		var bandInfos = [
			Timeline.createBandInfo({
				eventSource:    eventSource,
				date:           timelineStart,
				width:          "70%",
				intervalUnit:   Timeline.DateTime.MONTH,
				intervalPixels: 100
			}),
			Timeline.createBandInfo({
				overview:       true,
				eventSource:    eventSource,
				date:           timelineStart,
				width:          "30%",
				intervalUnit:   Timeline.DateTime.YEAR,
				intervalPixels: 200
			})
		];
		bandInfos[1].syncWith = 0;
		bandInfos[1].highlight = true;	

		tl = Timeline.create(document.getElementById("timeline"), bandInfos);
		eventSource.loadJSON(eventData, document.location.href);
	}());

 	// fill time <select> elements
 	$('#id_startDay').append(fillNums(1,31));
  	$('#id_startTimeHour').append(fillNumsPadded(1,12,2));
	$('#id_startTimeMin').append(fillNumsPadded(0,59,2));

 	$('#id_endDay').append(fillNums(1,31));
  	$('#id_endTimeHour').append(fillNumsPadded(1,12,2));
	$('#id_endTimeMin').append(fillNumsPadded(0,59,2));

	//Keep start/end time hidden
	$('#startTimeInput').hide();
	$('#endTimeInput').hide();

	$('#eventEnd').hide();

	$('#instant').click();

	$(".existing-tag").click(function () {
		var tag_chosen = $(this).text();
		$(this).attr("disabled", "disabled");
		$(this).attr('class','label tag existing-tag tmp-existing-tag')
		$('#selected_tags_box').append("<button class=\"label label-info tag tmp-tag\" value=\"" + tag_chosen + "\" onclick=\"removeTag()\">" + tag_chosen + "</button>");
		tags_current[tag_chosen] = true;
	});

	var all_tags_html = "<button class='small-close close' onclick='closeTagBox()'>x</button>";
	if (existing_tags.length == 0) {
		all_tags_html += 'No tags';
	} else {
		for (var tag in existing_tags) {
			all_tags_html = all_tags_html + "<input type='checkbox' class='tag-checkbox' value='" + tag + "'>&nbsp;&nbsp;" + tag + "</input><br />";
		}
	}

	$('#setTagsMatch').qtip({
		content: all_tags_html,
		show: 'click',
//		hide: 'click',
		hide: { when:false },	//never hide, click 'x'
		style: {
			margin: 8,
			padding: 8,
			tip: 'topLeft',
			name: 'light',
			border: {
				radius: 6,
				width: 1
			}
		},
		position: {
			corner: {
				target: 'bottomRight',
				tooltip: 'topLeft'
			}
		}
	});

 });

function closeTagBox() {
	$("#setTagsMatch").qtip("hide");
	if (selected_tags > 0) {
		$("#setTagsMatch").text(selected_tags);
	} else {
		$("#setTagsMatch").text('all');
	}

}

jQuery(document.body).on('click','.tag-checkbox', function(event) {
	var isChecked = $(this).is(':checked');
	var tag = $(this).val();

	if (isChecked) {
		filter_tags[tag] = true;
		selected_tags += 1;
	} else {
		if (tag in filter_tags) {
			delete filter_tags[tag];
			selected_tags -= 1;
		}
	}

});

// Removes a tag from the selected tags div
jQuery(document.body).on('click', '.tmp-tag', function(event) {
	var tag_to_delete = $(this);
	var tag = tag_to_delete.text();

	if (tag in existing_tags) {
		var tag_elt = $('.tmp-existing-tag').filter(function (index){
		    return this.value == tag;
		});

		tag_elt.removeAttr('disabled');
		tag_elt.attr('class','label label-info tag existing-tag');
	}

	tag_to_delete.remove();

	if (tags_editing_mode) {
		tags_current[tag] = false;
	} else {
		delete tags_current[tag];
	}

});

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    crossDomain: false, // obviates need for sameOrigin test
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

// edit an event
function loadEventForEdit(event) {
	event_editing_mode = true;
	tags_editing_mode = true;

	var db_id = event._db_id;
	$('#id_db_id').attr('value',db_id);

	var title = event._text;
	$('#id_title').val(title);

	var description = event._description;
	$('#id_description').val(description);

	var start_full = extractTimeInfo(event._start);

	var start_day = start_full[0];
	$('#id_startDay').val(start_day);

	var start_month = start_full[1];
	$('#id_startMonth').val(start_month);

	var start_year = start_full[2];
	$('#id_startYear').val(start_year);

	var start_hour = start_full[3];
	$('#id_startTimeHour').val(start_hour);

	var start_min = start_full[4];
	$('#id_startTimeMin').val(start_min);

	var start_ampm = start_full[5];
	$('#id_startAmPm').val(start_ampm);

	if (!event._instant) {
		$("#id_eventType").val("duration");
		$('#duration').button('toggle');
		$('#eventEnd').show();
		var end_full = extractTimeInfo(event._end);

		var end_day = end_full[0];
		$('#id_endDay').val(end_day);

		var end_month = end_full[1];
		$('#id_endMonth').val(end_month);

		var end_year = end_full[2];
		$('#id_endYear').val(end_year);

		var end_hour = end_full[3];
		$('#id_endTimeHour').val(end_hour);

		var end_min = end_full[4];
		$('#id_endTimeMin').val(end_min);

		var end_ampm = end_full[5];
		$('#id_endAmPm').val(end_ampm);
	}

	var tags_list = event._tags;
	for (var i=0;i<tags_list.length;i++){
		tag = tags_list[i];
		this.tags_current[tag] = true;
		this.tags[tag] = true;
		$('#newEventSelectedTags').append("<label class=\"label label-info tag\">" + tag + "</label>");
	}

	$('#newEvent').modal('show');
}

function extractTimeInfo(datetime_str) {
	var date = datetime_str.split("T")[0];
	var time = datetime_str.split("T")[1];

	var day = '' + parseInt(date.split("-")[2]);
	var month_int = parseInt(date.split("-")[1]);
	var year = date.split("-")[0];

	var month;
	switch (month_int) {
		case 1:
			month = "January";
			break;
		case 2:
			month = "February";
			break;
		case 3:
			month = "March";
			break;
		case 4:
			month = "April";
			break;
		case 5:
			month = "May";
			break;
		case 6:
			month = "June";
			break;
		case 7:
			month = "July";
			break;
		case 8:
			month = "August";
			break;
		case 9:
			month = "September";
			break;
		case 10:
			month = "October";
			break;
		case 11:
			month = "November";
			break;
		case 12:
			month = "December";
			break;
	}

	var ampm = "AM";
	var hour = parseInt(time.split(":")[0]);
	if (hour > 12) {
		hour = hour - 12;
		ampm = "PM";
	}
	hour = hour + "";
	if (hour.length < 2) {
		hour = "0" + hour;
	}

	var min = time.split(":")[1];

	return [day,month,year,hour,min,ampm];
}

// Resets new event form
function discardNewEvent(){
	if ($("#id_eventType").val() == "duration") {
		$('#instant').button('toggle');
	}

	$("#id_eventType").val("instant");
	$("#id_startTimeEnabled").val('False');
	$("#id_endTimeEnabled").val('False');

	$("#id_title").val('');
	$("#id_description").val('');

	$("#id_startDay").val('1');
	$("#id_startMonth").val('January');
	$("#id_startYear").val('');
	$("#id_startTimeHour").val('01');
	$("#id_startAmPm").val('AM');
	$("#id_startTimeMin").val('00');

	$("#id_endDay").val('1');
	$("#id_endMonth").val('January');
	$("#id_endYear").val('');
	$("#id_endTimeHour").val('01');
	$("#id_endAmPm").val('AM');
	$("#id_endTimeMin").val('00');

	$('#addStartTime').show();
	$('#startTimeInput').hide();
	$('#eventEnd').hide();

	$('#newEventSelectedTags').empty();
	this.tags = {};
	this.tags_current = {};
}

/*
/ Tags
*/

function removeTag() {
	//do something
}

function selectTag() {
	var text = $("#new_tag").val();
	$("#new_tag").val('');
	if (!(text in tags_current)) {
		tags_current[text] = true;
		$("#selected_tags_box").append("<button class=\"label label-info tag tmp-tag\" value=\"" + text + "\" onclick=\"removeTag()\">" + text + "</button>");
	}
}

function resetTagBox() {
	tags = {};
	tags_current = {};

	// reset tag box html
	$('#selected_tags_box').html('');
	var tag_elt = $('.tmp-existing-tag');
	tag_elt.removeAttr('disabled');
	tag_elt.attr('class','label label-info tag existing-tag');	
}

function closeTagsNoChange() {
	if (tags_editing_mode) {
		resetTagBox();
		switchEventTag();
	} else {
		tags_current = jQuery.extend(true, {},tags);
		chooseTags();
		discardSelectedTags();
	}
}

function switchEventTag(){
	if (!tags_editing_mode){
		$("#newEvent").modal('toggle');
	}
	$("#newTag").modal('toggle');
}

function doneTagging() {
	if (tags_editing_mode) {
		submitTags(this.current_event_id);
	} else {
		chooseTags();
	}
}

function chooseTags() {
	$("#newEventSelectedTags").html('');
	tags_html = '';

	for (var tag in tags_current) {
		tags_html += "<label class=\"label label-info tag\">" + tag + "</label>";
	}

	$("#newEventSelectedTags").html(tags_html);
	tags = jQuery.extend(true, {},tags_current);

	switchEventTag();
}

//tags_current holds selected tags. Discard these, and only look at tags
function discardSelectedTags() {
	$("#selected_tags_box").html('');
	for (var tag in tags){
		$("#selected_tags_box").append("<button class=\"label label-info tag\" value=\"" + tag + "\" onclick=\"removeTag()\">" + tag + "</button>");
	}

	$('.tmp-existing-tag').removeAttr('disabled');
	$('.tmp-existing-tag').attr('class','label label-info tag existing-tag');
}

function clearTags(){
	this.tags = {};
	this.tags_current = {};
	$("#selected_tags_box").html('');
}

function loadTagsForEdit(event_tags,current_event_id) {
	this.tags_editing_mode = true;
	this.current_event_id = current_event_id;

	var tmp_tags = {};

	for (var i=0;i<event_tags.length;i++) {
		text = event_tags[i];

		tmp_tags[text] = true;

		$("#selected_tags_box").append("<button class=\"label label-info tag tmp-tag\" value=\"" + text + "\" onclick=\"removeTag()\">" + text + "</button>");

		if (text in existing_tags) {
			var tag_elt = $('.existing-tag').filter(function (index){
			    return this.value == text;
			});

			tag_elt.attr('disabled','disabled');
			tag_elt.attr('class','label tag existing-tag tmp-existing-tag');
		}
	}

	this.tags = jQuery.extend(true, {},tmp_tags);
	this.tags_current = jQuery.extend(true, {},tmp_tags);

	$("#newTag").modal('show');
}

function submitTags(event_id) {

    var data = {id: event_id, tag_list: JSON.stringify(this.tags_current)};
    var tagUrl = "/tag/";

    $.ajax({ 
        type:"POST",
        url: tagUrl, 
        dataType: 'json', 
        data: data, 
        success: tagsSubmitted
    });

    return false;
}

function tagsSubmitted(response, status) {
    if (status == "success") {
        reloadTimeline(response);
        resetTagBox();
        $("#newTag").modal('hide');
    }
}

function addEventToTimeline(timeline_id) {

	var data = {
		id: timeline_id,
		edit: event_editing_mode,
		title: $("#id_title").val(),
		description: $("#id_description").val(),
		startDay: $("#id_startDay").val(),
		startMonth: $("#id_startMonth").val(),
		startYear: $("#id_startYear").val(),
		startTimeEnabled: $("#id_startTimeEnabled").val(),
		startTimeHour: $("#id_startTimeHour").val(),
		startAmPm: $("#id_startAmPm").val(),
		startTimeMin: $("#id_startTimeMin").val(),
		eventType: $("#id_eventType").val(),
		endDay: $("#id_endDay").val(),
		endMonth: $("#id_endMonth").val(),
		endYear: $("#id_endYear").val(),
		endTimeEnabled: $("#id_endTimeEnabled").val(),
		endTimeHour: $("#id_endTimeHour").val(),
		endAmPm: $("#id_endAmPm").val(),
		endTimeMin: $("#id_endTimeMin").val(),
		tags: JSON.stringify(tags)
	};

	if (event_editing_mode) {

		data['db_id'] = $('#id_db_id').val();
		data['tag_list'] = JSON.stringify(this.tags_current);

		var editEvent = "/editevent/";

		$.ajax({ 
			type:"POST", 
			url: editEvent, 
			dataType: 'json', 
			data: data, 
			success: createEventDone
		});

	} else {
		var createUrl = "/addevent/";

		$.ajax({ 
			type:"POST", 
			url: createUrl, 
			dataType: 'json', 
			data: data, 
			success: createEventDone
		});
	}

	return false;
}

function createEventDone(response, status) {
	if (status == "success") {
		reloadTimeline(response);
		$('.tmp-existing-tag').attr('disabled','disabled');
		$('.tmp-existing-tag').attr('class','label tag existing-tag selected-existing-tag');
	}
}

function resetFilters() {
	$('#minVotes').val(0);
	$('#setTagsMatch').text('all');

	filter_tags = {};
	selected_tags = 0;
	
	filterEvents(timeline_id);
}

function filterEvents(timeline_id) {

    var data = {id: timeline_id, votes: $('#minVotes').val(),tag_list: JSON.stringify(filter_tags)};
    var filterUrl = "/filter/";

    $.ajax({ 
        type:"POST",
        url: filterUrl,
        dataType: 'json',
        data: data,
        success: filterDone
    });

    return false;
}

function filterDone(response, status) {
    if (status == "success") {
        reloadTimeline(response);
    }
}

//given HTML element id, changes the value between 'True' and 'False'
//used to change id_startTimeEnabled and id_endTimeEnabled attributes
function toggleTimeEnabled(id){
	var x = $('#' + id);
	if (x.attr('value') === 'True'){
		x.attr("value", "False");
	} else {
		x.attr("value", "True");
	}
}

function displayTimeFields(elt) {
	$('#'+elt).show();
}

function toggleEventType(value) {
	if (value == "instant"){
		$('#eventEnd').hide();
	} else {
		$('#eventEnd').show();
	}
	$('#id_eventType').attr("value",value);
}

function fillDays() {
	var i = 1;
	var days = "";

	while (i <= 31) {
		var snip = "<option>" + i + "</option>";
		days += snip;
		i++;
	}
	return days;
}

function fillNums(start, max) {
	var i = start;
	var days = "";

	while (i <= max) {
		var snip = "<option>" + i + "</option>";
		days += snip;
		i++;
	}
	return days;
}

function fillNumsPadded(start, max, l) {
	var i = start;
	var days = "";

	while (i <= max) {
		x = i.toString();
		while (x.length < l) {
			x = "0" + x
		}

		var snip = "<option>" + x + "</option>";
		days += snip;
		i++;
	}
	return days;
}

// Validate YYYY field
// Doesn't get called!
$('#startYear').keypress(function(e) {
	var a = [];
	var k = e.which;
    
    for (i = 48; i < 58; i++)
        a.push(i);

    if (!($.inArray(k,a)>=0))
        e.preventDefault();
});
