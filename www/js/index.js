/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var uuid = "ebc92429-483e-4b91-b5f2-ead22e7e002d";
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        window.pebblekit.setup(uuid, function () {
          app.fetchCalendarEvent();
        });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    fetchCalendarEvent: function () {
        var startDate = new Date(); // Now
        var endDate = new Date();
        endDate.setHours(24, 0, 0, 0); // Nearest midnight in the future

        window.plugins.calendar.findEvent(
            // undefined = no filter
            undefined, // title
            undefined, // eventLocation
            undefined, // notes
            startDate,
            endDate,
            app.calendarSuccessCallback,
            app.calendarFailureCallback
        );
    },

    calendarSuccessCallback: function (events) {
        if (events.length == 0) {
            // TODO
            return;
        }

        // Find the earliest returned event
        var earliestEvent = events[0];
        for (var i = 1; i < events.length; i++) {
            var tempDate = events[i];
            var date1 = Date.parse(earliestEvent.startDate);
            var date2 = Date.parse(tempDate.startDate);

            if (date2 < date1) {
                earliestEvent = tempDate;
            }
        }

        // Format is in YYYY-MM-DD HH:mm:ss
        var hourString = earliestEvent.startDate.substring(11, 13);
        var hour = parseInt(hourString);
        var minuteString = earliestEvent.startDate.substring(14, 16);
        var minute = parseInt(minuteString);

        // AppMessage keys
        var data = {
            '10': earliestEvent.title,
            '11': hour,
            '12': minute
        };

        window.pebblekit.sendAppMessage(uuid, data, function () {
            console.log('sent AppMessage', data);
        }, function (err) {
            console.error('Couldn\'t send AppMessage', err);
        });

    },

    calendarFailureCallback: function (err) {
        console.error('Failed to fatch calendar events', err);
    }

};

app.initialize();