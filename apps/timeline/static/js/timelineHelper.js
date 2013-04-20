// Provides helper functions for the SIMILE timeline widget

// Loading constants
Timeline_ajax_url="/static/timeline_simile/src/ajax/api/simile-ajax-api.js";
Timeline_urlPrefix='/static/timeline_simile/src/webapp/api/';
Timeline_parameters='bundle=false';

// Gets the start date of the timeline
var getTimelineStart = function(events) {
	if (events.length > 0) {
		var date = new Date(events[0].start);

		for (var i=1;i<events.length;i++) {
			var d = new Date(events[i].start);
			if (d.getTime() < date.getTime()) {
				date = d;
			}		
		}
		return date.toGMTString();
	} else {
		return new Date().toGMTString();
	}
}

// CALCULATE DENSITY FUNCTION OF EVENTS
var getEventsInterval = function(events) {
	//do stuff
	return Timeline.DateTime.MONTH;
}

// $(function() {
	
// });

//   var timelineStart = "Jun 28 1993 00:00:00 GMT";
//   var eventData = {{ json_events }};
//   <script type="text/javascript">
//   
//   </script>