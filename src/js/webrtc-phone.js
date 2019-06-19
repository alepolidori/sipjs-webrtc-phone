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
  let remoteStreamAudio;
  let remoteStreamVideo;
  let localStreamVideo;

  let initAndLogin = data => {
    remoteStreamAudio = $('#' + data.audioId).get(0);
    remoteStreamVideo = $('#' + data.remoteVideoId).get(0);
    localStreamVideo = $('#' + data.localVideoId).get(0);
    name = data.name;
    exten = data.exten;
    server = data.server;
    password = data.password;
    url = 'wss://' + server + ':8089/ws';
    let configuration = {
      uri: exten + '@' + server,
      transportOptions: {
        wsServers: [ url ],
        traceSip: false
      },
      authorizationUser: exten,
      password: password  
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
        },
        // peerConnectionOptions: {
        //   rtcConfiguration: {
        //     iceServers: [{
        //       urls: []
        //     }]
        //   }
        // },
        // offerConstraints: {
        //   'offerToReceiveAudio': true
        // },
        // mandatory: [{
        //     OfferToReceiveAudio: true,
        //     OfferToReceiveVideo: true
        //   },
        //   {
        //     'DtlsSrtpKeyAgreement': true
        //   }
        // ]
      }
    };
    counterpartNum = to;
    try {
      rtcSession = phone.invite(to + '@' + server);
    } catch (error) {
      console.error(error);
    }
    attachEvtListeners();
  };

  let answer = () => {
    let options =  {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: true
        }
      }
    };
    attachEvtListeners();
    rtcSession.accept(options);
  };

  let hangup = e => {
    if (rtcSession && rtcSession.terminate) {
      rtcSession.terminate();
    }
  };

  let getCounterpartNum = () => {
    return rtcSession.remoteIdentity._displayName + ' ' + rtcSession.remoteIdentity.uri.user;
  };

  let attachEvtListeners = () => {
    rtcSession.on('progress', e => {
      console.log('progress');
      console.log(e);
      $(document).trigger('calling');
    });
    rtcSession.on('accepted', e => {
      console.log('accepted');
      console.log(e);
      $(document).trigger('callaccepted');
    });
    rtcSession.on('rejected', e => {
      console.log('rejected');
      console.log(e);
      $(document).trigger('callaccepted');
    });
    rtcSession.on('failed', e => {
      console.log('failed');
      console.log(e);
    });
    rtcSession.on('terminated', e => {
      console.log('terminated');
      console.log(e);
      $(document).trigger('hangup');
      rtcSession;
    });
    rtcSession.on('cancel', e => {
      console.log('cancel');
      console.log(e);
    });
    rtcSession.on('reinvite', e => {
      console.log('reinvite');
      console.log(e);
    });
    rtcSession.on('referRequested', e => {
      console.log('referRequested');
      console.log(e);
    });
    rtcSession.on('replaces', e => {
      console.log('replaces');
      console.log(e);
    });
    rtcSession.on('dtmf', e => {
      console.log('dtmf');
      console.log(e);
    });
    rtcSession.on('sessionDescriptionHandler-created', e => {
      console.log('sessionDescriptionHandler');
      console.log(e);
    });
    rtcSession.on('directionChanged', e => {
      console.log('directionChanged');
      console.log(e);
    });
    rtcSession.on('trackAdded', () => {
      let pc = rtcSession.sessionDescriptionHandler.peerConnection;

      let remoteStream = new MediaStream();
      pc.getReceivers().forEach((receiver) => {
        remoteStream.addTrack(receiver.track);
      });
      // remoteStreamAudio.srcObject = remoteStream;
      remoteStreamVideo.srcObject = remoteStream;

      var localStream = new MediaStream();
      pc.getSenders().forEach(function (sender) {
        localStream.addTrack(sender.track);
      });
      localStreamVideo.srcObject = localStream;
    });
    rtcSession.on('bye', e => {
      console.log('bye');
      console.log(e);
      $(document).trigger('hangup');
    });
  };

  let getRTCSession = () => {
    return rtcSession;
  };

  let getPhone = () => {
    return phone;
  };

  return {
    call: call,
    logout: logout,
    answer: answer,
    hangup: hangup,
    getPhone: getPhone,
    initAndLogin: initAndLogin,
    getRTCSession: getRTCSession,
    getCounterpartNum: getCounterpartNum
  };

})();