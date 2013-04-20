var events;
var tags;

var event_editing_mode = false;
var current_event_id;

////////// AJAX SETUP //////////////

var getCookie = function(name) {
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

var csrfSafeMethod = function(method) {
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

////////// DOCUMENT READY //////////

$(document).ready(function() {
	SimileAjax.History.enabled = false;

	$.getJSON('data', function(data) {

		var events = JSON.parse(data[0]);
		var tags = JSON.parse(data[1]);

		var timelineStart = getTimelineStart(events.events);
		var intervalUnit = getEventsInterval(events.events);

		//load timeline
		(function() {
			var eventSource = new Timeline.DefaultEventSource();
			var bandInfos = [
				Timeline.createBandInfo({
					eventSource:    eventSource,
					date:           timelineStart,
					width:          "70%",
					intervalUnit:   intervalUnit,
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
			eventSource.loadJSON(events, document.location.href);
		}());

		displayTags(tags);

		$(".chzn-select").chosen();
		$(".default").css("width","350px");
		$(".chzn-choices").css("width","350px");
		$(".chzn-results").css("width","350px");

		$('#tag_box').tagit({
			allowSpaces: true,
		});
	});

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

	// New event modal
	$('.discardEventModal').click(function(e) {
		event_editing_mode = false;
		$("#tag_box").tagit("removeAll");
		discardNewEvent();
	});

	$('#instant').click(function(e) {
		toggleEventType('instant');
	});

	$('#duration').click(function(e) {
		toggleEventType('duration');
	});

	$('#addStartTime').click(function(e) {
		$('#startTimeInput').show(); 
		$('#removeStartTime').show(); 
		toggleTimeEnabled('id_startTimeEnabled'); 
		$(this).hide();
	});

	$('#removeStartTime').click(function(e) {
		$('#startTimeInput').hide(); 
		$('#addStartTime').show(); 
		toggleTimeEnabled('id_startTimeEnabled'); 
		$(this).hide();
	});

	$('#addEndTime').click(function(e){
		$('#endTimeInput').show(); 
		$('#removeEndTime').show(); 
		toggleTimeEnabled('id_endTimeEnabled'); 
		$(this).hide();
	});

	$('#removeEndTime').click(function(e) {
		$('#endTimeInput').hide(); 
		$('#addEndTime').show(); 
		toggleTimeEnabled('id_endTimeEnabled'); 
		$(this).hide();
	});

	$('#create_event').click(function (e) {
		addEventToTimeline(); 
		discardNewEvent();
	});

	$('#apply_filter').click(function(e) {
		var tags = [];
		var chosen = $(".search-choice").children('span').each( function(index) {
			tags.push($(this)[0].innerHTML);
		});

	    var data = {votes: $('#minVotes').val(),tag_list: JSON.stringify(tags)};
	    var filterUrl = "filter/";

	    $.get('filter/', data, filterDone);
	});

	$('#reset_filter').click(function(e) {
		$('#minVotes').val(0);
		$('option').prop('selected', false);
		$('select').trigger('liszt:updated');

		var data = {votes: 0,tag_list: JSON.stringify([])};
		var filterUrl = "/timeline/filter/";

	    $.get('filter/', data, filterDone);

	});

 });

////////// EVENTS //////////

// edit an event
var loadEventForEdit = function(event) {
	event_editing_mode = true;

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

	$("#tag_box").tagit("removeAll");
	var tags_list = event._tags;
	if (tags_list) {
		for (var i=0;i<tags_list.length;i++){
			$('#tag_box').tagit('createTag',tags_list[i]);
		}
	}

	$('#newEvent').modal('show');
}

var displayTags = function(tags) {
	var tagsSelect = $('#allTags');
	for (var i=0;i<tags.length;i++) {
		var tag = tags[i];
		tagsSelect.append("<option value=\"" + tag + "\">" + tag + "</option>");
	}
}

var extractTimeInfo = function(datetime_str) {
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
var discardNewEvent = function(){
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

	$("#tag_box").val('');

}

var addEventToTimeline = function() {
	var data = {
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
		tags: $('#tag_box').val(),
	};

	if (event_editing_mode) {
		data['db_id'] = $('#id_db_id').val();

		var editEvent = "edit/";

		$.ajax({ 
			type:"POST", 
			url: editEvent, 
			dataType: 'json', 
			data: data, 
			success: createEventDone
		});

	} else {
		var createUrl = "add/";

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
	
	filterEvents();
}

function filterEvents() {

    var data = {votes: $('#minVotes').val(),tag_list: JSON.stringify(filter_tags)};
    var filterUrl = "/timeline/filter";

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
