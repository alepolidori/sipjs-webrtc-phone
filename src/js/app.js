'use strict';

$(function () {

  let ringing = new Audio('sounds/ringing.mp3');
  let calling = new Audio('sounds/calling.mp3');
  ringing.loop = true;
  calling.loop = true;

  $(document).on('registered', function (ev) {
    noRingtone();
    $('#login-btn, #server-address, #name, #exten, #password').attr('disabled','disabled');
    $('#logout-btn,#call-to,#call-btn').removeAttr('disabled');
    $('#call-to').focus();
    $('#output-lbl').text('Registered');
  });

  $(document).on('unregistered', function (ev) {
    noRingtone();
    $('#login-btn, #server-address, #name, #exten, #password').removeAttr('disabled');
    $('#logout-btn,#call-to,#call-btn').attr('disabled','disabled');
    $('#output-lbl').text('Unregistered');
  });

  $(document).on('calling', function (ev) {
    noRingtone();
    calling.play();
    $('#hangup-btn').removeAttr('disabled');
    $('#call-btn,#call-to').attr('disabled','disabled');
    $('#output-lbl').text('Calling ' + webrtcPhone.getCounterpartNum() + '...');
  });

  $(document).on('incomingcall', function (ev, from) {
    noRingtone();
    ringing.play();
    $('#hangup-btn,#answer-btn').removeAttr('disabled');
    $('#call-btn,#call-to').attr('disabled','disabled');
    $('#output-lbl').text('...incoming call from ' + from);
  });

  $(document).on('callaccepted', function (ev) {
    noRingtone();
    $('#hangup-btn').removeAttr('disabled');
    $('#call-btn,#call-to,#answer-btn').attr('disabled','disabled');
    $('#output-lbl').text('...in conversation with ' + webrtcPhone.getCounterpartNum());
  });

  $(document).on('hangup', function (ev) {
    noRingtone();
    $('#hangup-btn,#answer-btn').attr('disabled','disabled');
    $('#call-btn,#call-to').removeAttr('disabled');
    $('#output-lbl').text('Registered');
  });

  $('#login-btn').click(function () {
    webrtcPhone.initAndLogin({
      server: $('#server-address').val(),
      name: $('#name').val(),
      exten: $('#exten').val(),
      password: $('#password').val(),
      audioId: 'remote-stream-audio',
      localVideoId: 'local-stream-video',
      remoteVideoId: 'remote-stream-video'
    });
  });

  $('#logout-btn').click(function () {
    noRingtone();
    webrtcPhone.hangup();
    webrtcPhone.logout();
  });

  $('#hangup-btn').click(function () {
    webrtcPhone.hangup();
  });

  $('#answer-btn').click(function () {
    webrtcPhone.answer();
  });

  $('#call-audio-video-btn').click(function () {
    var to = $('#call-to').val();
    webrtcPhone.call(to, true);
  });

  $('#call-audio-btn').click(function () {
    var to = $('#call-to').val();
    webrtcPhone.call(to, false);
  });

  let noRingtone = () => {
    calling.pause();
    ringing.pause();
  };
});