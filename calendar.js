/*****************************************************************
* Shawn Wonder                                                   *
* 03/14/2016                                                     *
* Calendar with events view                                      *
******************************************************************/

"use strict"

jQuery(function($) {
  var i = 0;
  var k = 0;
  var months = [
                ['00', 'January', 31],
                ['01', 'February', 28],
                ['02', 'March', 31],
                ['03', 'April', 30],
                ['04', 'May', 31],
                ['05', 'June', 30],
                ['06', 'July', 31],
                ['07', 'August', 31],
                ['08', 'September', 30],
                ['09', 'October', 31],
                ['10', 'November', 30],
                ['11', 'December', 31]
               ];
  var days = [
                [0, 'S', 'Sunday'],
                [1, 'M', 'Monday'],
                [2, 'T', 'Tuesday'],
                [3, 'W', 'Wednesday'],
                [4, 'T', 'Thursday'],
                [5, 'F', 'Friday'],
                [6, 'S', 'Saturday']
             ]

  var day;
  var prevday;
  var week;
  var firstDayOfMonth;
  var dowFirstDay;
  var weekNumber;

  var view = 'calendar';

  //Main object that holds all the events
  var events = {};

  //Get the day for the first day of this year
  var today = new Date();
  var nowYear = today.getFullYear();
  var nowMonth = ('0' + today.getMonth()).slice(-2); //2 digit format
  var nowDay = ('0' + today.getDate()).slice(-2);

  //3 variables are the dates the user is working with
  var activeYear = today.getFullYear();
  var activeMonth = ('0' + today.getMonth()).slice(-2);
  var activeDay = ('0' + today.getDate()).slice(-2);

  //Initialization
  printMonth(activeYear, activeMonth, activeDay);
  $('#' + nowYear + '-' + months[Number(nowMonth)][0] + '-' + nowDay).addClass('highlightday');
  prevday = nowYear + '-' + months[Number(nowMonth)][0] + '-' + nowDay;
  createEventForm(nowYear + '-' + months[Number(nowMonth)][0] + '-' + nowDay);

  //Click handlers
  //When a day is clicked load the input box and button below
  $('#calendar').on('click', '.day', function() {
    if(prevday) {
      $('#' + prevday).removeClass('highlightday');
    }
    prevday = $(this).attr('id');
    $(this).attr('id')
    var ymd = $(this).attr('id').split('-');
    //Set the new active date to work with
    activeYear = ymd[0];
    activeMonth = ymd[1];
    activeDay = ymd[2];
    $(this).addClass('highlightday');
    $('#evt').html('');
    createEventForm($(this).attr('id'));
    showDailyEvents(activeYear, activeMonth, activeDay);
  });

  function createEventForm(id) {
    $('#evt')
      .append($('<div>').addClass('ae')
        .append($('<div>').addClass('aetitle').html('Add an Event'))
        .append($('<form>').submit(function() { return false; })
          .append($('<input>').attr('type', 'hidden').attr('id', 'evtid').attr('value', id))
          .append($('<input>').attr('type', 'text').attr('id', 'evtmsg').keyup(function(event) {
                                                                                if(event.keyCode == 13) {
                                                                                  $("#addevent").click();
                                                                                }
                                                                                return false;
                                                                              }))
          .append($('<input>').attr('type', 'button').attr('value', 'Go').attr('id', 'addevent'))
        )
      )
  }

  //When the 'Add' button is clicked for an event
  $('#evt').on('click', '#addevent', function() {
    addEvent($('#evtid').attr('value'), $('#evtmsg').val());
    showDailyEvents(activeYear, activeMonth, activeDay);
  });

  //Click handler for left arrow on the calendar
  $('#calendar').on('click', '#submonth', function() {
    if(activeMonth >= 1) {
      activeMonth--;
      activeMonth = months[Number(activeMonth)][0];
    } else {
      activeMonth = '11';
      activeYear--;
    }
    activeDay = 1;
    printMonth(activeYear, activeMonth);
    //Set the first day of the month as active
    $('#' + activeYear + '-' + months[Number(activeMonth)][0] + '-' + activeDay).addClass('highlightday');
    prevday = activeYear + '-' + months[Number(activeMonth)][0] + '-' + activeDay;
    createEventForm(activeYear + '-' + months[Number(activeMonth)][0] + '-' + activeDay);
  });
  //Click handler for right arrow on the calendar
  $('#calendar').on('click', '#addmonth', function() {
    if(activeMonth < 11) {
      activeMonth++;
      activeMonth = months[Number(activeMonth)][0];
    } else {
      activeMonth = '00';
      activeYear++;
    }
    activeDay = 1;
    printMonth(activeYear, activeMonth);
    //Set the first day of the month as active
    $('#' + activeYear + '-' + months[Number(activeMonth)][0] + '-' + activeDay).addClass('highlightday');
    prevday = activeYear + '-' + months[Number(activeMonth)][0] + '-' + activeDay;
    createEventForm(activeYear + '-' + months[Number(activeMonth)][0] + '-' + activeDay);
  });

  //Show calendar view or events view
  $('#eventslink').click(function() {
    if(view === 'calendar') {
      clearCalendar();
      $('#eventslink').html('Calendar');
      printEvents();
      view = 'events';
    } else {
      clearEvents();
      printMonth(activeYear, activeMonth);
      $('#' + activeYear + '-' + months[Number(activeMonth)][0] + '-' + activeDay).addClass('highlightday');
      prevday = activeYear + '-' + months[Number(activeMonth)][0] + '-' + activeDay;
      createEventForm(activeYear + '-' + months[Number(activeMonth)][0] + '-' + activeDay);
      showDailyEvents(activeYear, activeMonth, activeDay);
      $('#eventslink').html('Events');
      view = 'calendar';
    }
  });

  function clearCalendar() {
    $('#calendar').html('');
    $('#evt').html('');
    $('#de').html('');
  }

  function clearEvents() {
    $('#listevents').html('');
  }

  function printMonth(activeYear, activeMonth, activeDay = 0) {
    clearCalendar();
    $('#calendar')
      .append($('<div>').addClass('monthyear')
        .append($('<div>').attr('id', 'submonth').html('&laquo;'))
        .append($('<div>').attr('id', 'month').html(months[Number(activeMonth)][1] + ' ' + activeYear))
        .append($('<div>').attr('id', 'addmonth').html('&raquo;')))
      .append($('<div>').addClass('clear'))
      .append($('<div>').addClass('days'))
      .append($('<div>').attr('id', activeMonth + 'week1').addClass('weeks'))
      .append($('<div>').attr('id', activeMonth + 'week2').addClass('weeks'))
      .append($('<div>').attr('id', activeMonth + 'week3').addClass('weeks'))
      .append($('<div>').attr('id', activeMonth + 'week4').addClass('weeks'))
      .append($('<div>').attr('id', activeMonth + 'week5').addClass('weeks'))
      .append($('<div>').attr('id', activeMonth + 'week6').addClass('weeks'));

    //S M T W T F S line
    $.each(days, function(index, daysInfo) {
      $('.days').append($('<div>').addClass(daysInfo[2]).html(daysInfo[1]));
    });

    firstDayOfMonth = new Date(activeYear, activeMonth, 1);
    dowFirstDay = firstDayOfMonth.getDay();
    //Construct an array that holds the first week's day values
    week = [];
    weekNumber = 1;
    //Calculate the days in the first week of the month after the 1st
    day = 1;
    for(i = dowFirstDay; i <= 6; i++) {
      week[i] = day;
      day++;
    }
    var dayID;
    $.each(week, function (key, day) {
       dayID = day ? activeYear + '-' + months[Number(activeMonth)][0] + '-' + day : '';
      $('#' + activeMonth + 'week1')
        .append($('<div>').attr('id', dayID).addClass('day').html(day));
    });
    //End first Week stuff

    //Rest of the weeks
    weekNumber = 2;
    var l = 0;
    for(k = day; k <= months[Number(activeMonth)][2]; k++) {
      if(day > months[Number(activeMonth)][2]) {
        day = 1;
      }
      if(l == 7) {
        weekNumber++;
        i = 0;
      }

      $('#' + activeMonth + 'week' + weekNumber)
        .append($('<div>').attr('id', activeYear + '-' + months[Number(activeMonth)][0] + '-' + day).addClass('day').html(day));

      //Highlight the selected day
      if(day == activeDay) {
        $('#' + activeYear + '-' + (activeMonth+1) + '-' + activeDay).addClass('highlightday');
        prevday = activeYear + '-' + (activeMonth+1) + '-' + activeDay;
      }
      day++;
      l++;
    }
  }

  function printEvents() {
    clearEvents();
    var validEvent = false;
    //Year-month
    if(!jQuery.isEmptyObject(events)) {
      $.each(events, function(monthYear, day) {
        var yearMonth = monthYear.split('-');
        $('#listevents').append($('<div>').attr('id', monthYear + 'month'));
        //Day
        $.each(day, function(key3, evt) {
          $('#' + monthYear + 'month').append($('<div>').attr('id', key3 + 'day'));
          validEvent = false;
          $.each(evt, function(key4, value) {
            //Same year, same month, and at least today or day later in month
            if(yearMonth[0] == Number(nowYear) && yearMonth[1] == Number(nowMonth) && key3 >= Number(nowDay)) {
              appendEditBox(key3 + 'day', yearMonth[0], yearMonth[1], key3, key4, value, false);
              validEvent = true;
            }
            //Same year but a future month
            if(yearMonth[0] == Number(nowYear) && yearMonth[1] > Number(nowMonth)) {
              appendEditBox(key3 + 'day', yearMonth[0], yearMonth[1], key3, key4, value, false);
              validEvent = true;
            }
            //A future year
            if(Number(yearMonth[0]) == (Number(nowYear)+1) && yearMonth[1] <= Number(nowMonth)) {
              appendEditBox(key3 + 'day', yearMonth[0], yearMonth[1], key3, key4, value, false);
              validEvent = true;
            }
          });
          if(validEvent) {
            $('#' + key3 + 'day').prepend($('<div>').addClass('eventday').html(months[Number(yearMonth[1])][1] + ' ' + key3 + ', ' + yearMonth[0]));
          }
        });
      });
    } else {
      $('#listevents').append($('<div>').html('<i>There are no events to display</i>'));
    }
  }

  function appendEditBox(id, y, m, d, i, content, displaydailies = false) {
    $('#' + id)
      .append($('<div>').addClass('textleft')
        .append($('<span>').click(function() { $(this).hide(); $(this).next().show(); }).html(content))
        .append($('<input>').attr('id', y + '-' + m + '-' + d + '-' + i ).change(function() {
                                                 updateEvent($(this).attr('id'), $(this).val(), displaydailies);
                                                 $(this).hide();
                                                 $(this).prev().show();
                                                }).val(content).hide())
      );
  }

  function addEvent(eventDate, eventMsg) {
    var ymd = eventDate.split('-');
    var y = ymd[0];
    var m = ymd[1];
    var d = ymd[2];

    //If year-month entry doesn't exist create it
    if(!events[y + '-' + m]) {
      events[y + '-' + m] = {};
    }

    //Day for year-month doesn't exist create it and add message
    if(!events[y + '-' + m][d]) {
      events[y + '-' + m][d] = [];
      events[y + '-' + m][d].push(eventMsg);
    } else { //Just add the message
      events[y + '-' + m][d].push(eventMsg);
    }

    //Clear the text input box
    $('#evtmsg').val('');
  }

  function updateEvent(id, msg, displaydailies) {
    var vals = id.split('-');
    if(msg == '') {
      delete events[vals[0] + '-' + vals[1]][vals[2]][vals[3]];
    } else {
      events[vals[0] + '-' + vals[1]][vals[2]][vals[3]] = msg;
    }
    if(displaydailies) {
      showDailyEvents(activeYear, activeMonth, activeDay);
    } else {
      printEvents();
    }
  }

  function showDailyEvents(y, m, d) {
    $('#de').html('');
    if(events[y + '-' + m]) {
      var dailyEvents = events[y + '-' + m][d];
      i = 0;
      if(dailyEvents) {
        $('#de').append($('<div>').addClass('detitle').html('What\'s happening today'));
      }
      $.each(dailyEvents, function(key, value) {
        appendEditBox('de', y, m, d, i, value, true);
        i++;
      })
    }
  }
});
