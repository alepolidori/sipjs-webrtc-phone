'use strict';

let webrtcPhone = (() => {

  const DEBUG = true;
  let server;
  let url;
  let password;
  let exten;
  let phone;
  let name;
  let counterpartNum;
  let rtcSession;
  let socket;
  let remoteStreamAudio;

  let initAndLogin = data => {
    // if (DEBUG) {
    //   JsSIP.debug.enable('JsSIP:*');
    // } else {
    //   JsSIP.debug.disable('JsSIP:*');
    // }
    remoteStreamAudio = $('#' + data.audioId).get(0);
    name = data.name;
    exten = data.exten;
    server = data.server;
    password = data.password;
    url = 'wss://' + server + ':8089/ws';
    let configuration = {
      uri: exten + '@' + server,
      transportOptions: {
        wsServers: [ url ]
      },
      authorizationUser: exten,
      password: password,
      iceServers: ''
    };
    try {
      phone = new SIP.UA(configuration);
    } catch (error) {
      console.error(error);
      return;
    }
    phone.on('registered', e => {
      console.log('registered');
      console.log(e);
      $(document).trigger('registered');
    });
    phone.on('unregistered', e => {
      console.log('unregistered');
      console.log(e);
      $(document).trigger('unregistered');
    });
    phone.on('registrationFailed', e => {
      console.log('registrationFailed');
      console.log(e);
    });
    phone.on('invite', session => {
      console.log('invite');
      console.log(session);
      rtcSession = session;
      $(document).trigger('incomingcall', counterpartNum);
    });
    phone.on('message', e => {
      console.log('message');
      console.log(e);
    });
    phone.on('outOfDialogReferRequested', e => {
      console.log('outOfDialogReferRequested');
      console.log(e);
    });
    phone.on('transportCreated', e => {
      console.log('transportCreated');
      console.log(e);
    });
    phone.start();
  };

  let logout = () => {
    phone.unregister();
  };

  let call = (to, video) => {
    let options = {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: video
        }
      }
      // pcConfig: {
      //   iceServers: []
      // }
    };
    counterpartNum = to;
    try {
      rtcSession = phone.invite(to + '@' + server);
      rtcSession.on('trackAdded', () => {
        let pc = rtcSession.sessionDescriptionHandler.peerConnection;
        let remoteStream = new MediaStream();
        pc.getReceivers().forEach((receiver) => {
          remoteStream.addTrack(receiver.track);
        });
        remoteStreamAudio.srcObject = remoteStream;
        // remoteStreamAudio.play();


        // Gets remote tracks
        // var remoteStream = new MediaStream();
        // pc.getReceivers().forEach(function (receiver) {
        //   remoteStream.addTrack(receiver.track);
        // });
        // remoteVideo.srcObject = remoteStream;
        // remoteVideo.play();

        // // Gets local tracks
        // var localStream = new MediaStream();
        // pc.getSenders().forEach(function (sender) {
        //   localStream.addTrack(sender.track);
        // });
        // localVideo.srcObject = localStream;
        // localVideo.play();
      });
    } catch (error) {
      console.error(error);
    }
  };

  let answer = () => {
    rtcSession.accept();

    rtcSession.on('trackAdded', () => {
      let pc = rtcSession.sessionDescriptionHandler.peerConnection;
      let remoteStream = new MediaStream();
      pc.getReceivers().forEach((receiver) => {
        remoteStream.addTrack(receiver.track);
      });
      remoteStreamAudio.srcObject = remoteStream;
      // remoteStreamAudio.play();


    });
    $(document).trigger('callaccepted');
  };

  let hangup = e => {
    rtcSession.terminate();
    $(document).trigger('hangup');
  };

  let getCounterpartNum = () => {
    return rtcSession.remoteIdentity._displayName + ' ' + rtcSession.remoteIdentity.uri.user;
  };

  return {
    call: call,
    logout: logout,
    answer: answer,
    hangup: hangup,
    initAndLogin: initAndLogin,
    getCounterpartNum: getCounterpartNum
  };

})();