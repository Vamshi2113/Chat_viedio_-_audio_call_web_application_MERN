

var connection =new WebSocket('ws://localhost:8886');
var conn_offer;
var peerConnection;
var conn_answer;
var Send_dataChannel;
var connectedUser, Receive_dataChannel;
var flag_send_datachannel;
let remoteStream;
let localStream;

session_userid=sessionStorage.getItem("userid");


console.log(connection)
connection.onopen=function(){
    connection.send(JSON.stringify({type:"hello",x:"eee"}))
    connection.send(JSON.stringify({type:"replace",from:session_userid}))
}
connection.onmessage=function(message){
    console.log("recieved");
    var data=JSON.parse(message.data);
    console.log(data);
    switch(data.type){
        case "message":
           // alert(data.from);
            return;
        case "offer":
            conn_offer=data.offer;
            var user2=data.from;
            var me=data.to;
            make_answer(me,user2);
            return;
        case "candidate":
            peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate)); 
            return;
        case "answer":
            peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            connection.send(JSON.stringify({
                type: "ready"
            }));

    }
}



function clicked(event){
    event.preventDefault();
    var x=event.target;

    console.log("sessionuser==:>",session_userid)

    var user2=x.id;
    connection.send(JSON.stringify({type:"message",from:session_userid,to:user2}))
 
    //var cook=getCookie("session_token");
    rtc_conn(user2,session_userid);



}



function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
 
    for(var i=0; i<ca.length; i++) {
       var c = ca[i];
       while (c.charAt(0)==' ') c = c.substring(1);
       if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
 
    return "";
 } 

 

   function create_webrtc_intial_connection(user2,useridx) {

    //ICE server
    var configuration = {
        "iceServers": [
            {
                "urls": "stun:stun.1.google.com:19302"
            },
            {
                urls: 'turn:192.158.29.39:3478?transport=tcp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
            }
        ]
    };
    //navigator.mediaDevices.getUserMedia({audio: true, video: true});
    peerConnection = new RTCPeerConnection(configuration); 
  
    console.log(peerConnection);
    
    //alert(peerConnection)
    //when the browser finds an ice candidate we send it to another peer 
    peerConnection.onicecandidate =function icecandidateAdded(ev) {
        console.log("ICE candidate = "+ ev.candidate);
        if (ev.candidate) {
            connection.send(JSON.stringify({
                type: "candidate",
                candidate: ev.candidate,
                to:user2,
                from:useridx
            }));
        }
    };


    peerConnection.oniceconnectionstatechange = handlestatechangeCallback;
    peerConnection.onnegotiationneeded = handleonnegotiatioCallback;

     //getting permission snd streaming first
    
    //adding streams to the wrtc

    remoteStream=new MediaStream();
    document.getElementById('user2').srcObject=remoteStream;

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track,localStream);
    });


    peerConnection.ontrack=(event)=>{
        console.log(event)
        event.streams[0].getTracks().forEach((track)=>{
            remoteStream.addTrack(track)
        })
    }

}


//same fun second time for user2




var handleonnegotiatioCallback = function(event){
    /* if you want , use this function for handleonnegotiatioCallback  */
};
var handlestatechangeCallback = function (event) {
     /* if you want , use this function for webrtc state change event  */
    const state = peerConnection.iceConnectionState;
    if (state === "failed" || state === "closed") {
       /* handle state failed , closed */
    } else if (state === "disconnected") {
       /* handle state disconnected */
    }
};


function Create_DataChannel(name) {

    const dataChannelOptions = {
        ordered: false,             // do not guarantee order
        maxPacketLifeTime: 3000,    // in milliseconds
    };

    var channelname = "webrtc_label_" + name;
    Send_dataChannel = peerConnection.createDataChannel(channelname, dataChannelOptions);
    console.log("Created DataChannel dataChannel = "+Send_dataChannel);

    Send_dataChannel.onerror =()=>{
        console.log("error")

    }
    Send_dataChannel.onerror = onSend_ChannelErrorState;
    Send_dataChannel.onmessage = onSend_ChannelMessageCallback;
    Send_dataChannel.onopen = onSend_ChannelOpenState;
    Send_dataChannel.onclose = onSend_ChannelCloseStateChange;
}



var onSend_ChannelOpenState = function (event) {
    flag_send_datachannel = true;
    console.log("send-dataChannel.OnOpen", event);
    Send_dataChannel.send("|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||")
    if (Send_dataChannel.readyState == "open") {
        /* */
    }
};
/**
 * This function will handle the data channel message callback.
 */
 var onSend_ChannelMessageCallback = function (event) {
    console.log("send-dataChannel.OnMessage:", event);
   
    //console.log("event.data===>",event.data)
};
/**
 * This function will handle the data channel error callback.
 */
var onSend_ChannelErrorState = function (error) {
    console.log("dataChannel.OnError:", error);
};
/**
 * This function will handle the data channel close callback.
 */
var onSend_ChannelCloseStateChange = function (event) {
    console.log("dataChannel.OnClose", event);
};


/**
 * This function will handle ICE candidate event. 
 */



async function creating_offer(user2,useridx) {

    try {
        const offer = await peerConnection.createOffer({iceRestart:true});
        //alert("offer is")
        //alert(offer)
        await peerConnection.setLocalDescription(offer);

        console.log("creating offer ---");
        console.log("offer = "+ peerConnection.localDescription);
        connection.send(JSON.stringify({
            type: "offer",
            offer: offer,
            to:user2,
            from:useridx

        }));

    } catch (e) {
         /*remove modal when any error occurs */
        alert("Failed to create offer:" + e);
        send(JSON.stringify({
            type:"error",
            error:e
        }));
        console.log("famield")
    }
}




async function make_answer(a,b) {
   
    //add tracks from user2 premissin
     //getting permission snd streaming first
    localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:false})
    document.getElementById('user1').srcObject=localStream;
    //create RTC peer connection from receive end
    create_webrtc_intial_connection(b,a);
    //create a data channel bind
    peerConnection.ondatachannel = receiveChannelCallback;
    peerConnection.setRemoteDescription(new RTCSessionDescription(conn_offer));
    creating_answer(b,a);
}


var receiveChannelCallback = function (event) {
    Receive_dataChannel = event.channel;
    Receive_dataChannel.onopen = onReceive_ChannelOpenState;
    Receive_dataChannel.onmessage = onReceive_ChannelMessageCallback;
    Receive_dataChannel.onerror = onReceive_ChannelErrorState;
    Receive_dataChannel.onclose = onReceive_ChannelCloseStateChange;
};

var onReceive_ChannelOpenState = function (event) {
    flag_send_datachannel = false;
    console.log("recieve-dataChannel.OnOpen", event);
    Receive_dataChannel.send("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||")
    

    if (Receive_dataChannel.readyState == "open") {
        
        /* */
    }
};

var onReceive_ChannelMessageCallback = function (event) {
    console.log("recieve-dataChannel.OnMessage:", event);
    console.log("event.data is================>",event.data)

};
 
/**
 * This function will handle the data channel error callback.
 */
var onReceive_ChannelErrorState = function (error) {
    console.log("dataChannel.OnError:", error);
};

var onReceive_ChannelCloseStateChange = function (event) {
    console.log("dataChannel.OnClose", event);
};
/**

/**
 * This function will create the webRTC answer for offer.
 */
function creating_answer(a,b) {

    peerConnection.createAnswer()
    .then(async function(answer) {
        console.log("absoulute ans===>",answer)
        console.log("peer connection is=",peerConnection)
        await peerConnection.setLocalDescription(answer);
        conn_answer = answer;
        console.log("creating answer  => answer = "+ peerConnection.localDescription);
        connection.send(JSON.stringify({
            type: "answer",
            answer: conn_answer,
            to:a,
            from:b
        }));
    })
    .catch(function(err) {
        console.log(err.name + ': ' + err.message);
        alert("answer is failed");
        //clear_incoming_modal_popup(); /*remove modal when any error occurs */
  });
}











async function rtc_conn(user2,useridx){
    localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:false})
    document.getElementById('user1').srcObject=localStream;
    //moving on to connections
    create_webrtc_intial_connection(user2,useridx);
    Create_DataChannel(user2);
    creating_offer(user2,useridx)

}



function showmsg(x){
    console.log("msg from datachannel====>",x)
    alert(x);
}
  
   
    
    

