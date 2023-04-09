

var connection =new WebSocket('ws://localhost:8886');
var conn_offer;
var peerConnection;
var conn_answer;
var Send_dataChannel;
var connectedUser, Receive_dataChannel;
var flag_send_datachannel;
let remoteStream;
let localStream;
var DATA_G;
var ice_arr=[];
var user2_g;

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
            if(data.k==0){
            let popup=document.getElementsByClassName('calling_popup_chat')[0]
            popup.style.visibility="visible";}
            else if(data.k==1){
                let popup=document.getElementsByClassName('calling_popup_viedio')[0]
                popup.style.visibility="visible";
            }
            DATA_G=data;
            console.log("datag=",DATA_G)

            
            return;

        case "declined":
            let popupx=document.getElementsByClassName('declined_popup')[0]
            popupx.style.visibility="visible";
            return;
            
        case "candidate":
            ice_arr[ice_arr.length]=data.candidate;
            console.log(ice_arr)
            //peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate)); 
            return;

        case "room_close":
            document.getElementsByClassName("messages")[0].innerHTML=" ";
            var temp = document.getElementsByClassName('chat_space')[0]
            temp.style.visibility="hidden";
            return;
        
        case "viedio_call_close":

            var temp = document.getElementsByClassName('viedio_call_space')[0]
            localStream.getTracks().forEach(function(track) {
                console.log("track is =>",track)
                track.stop();
              });
            temp.style.visibility="hidden";
            return;

        case "update_userlist":
            document.getElementsByClassName('userlist')[0].innerHTML=document.getElementsByClassName('userlist')[0].innerHTML+
                ` <div class="user">
                <div class="users">
                    <p>${data.item}</p>
                    
                </div>
                <div class="options">
                    <button class="chatroom_icon" value=0 id=${data.item} type="button"  onclick="clicked(event)" ></button>
                    <button class="audiocall_icon" value=2 id=${data.item} type="button"  onclick="clicked(event)" ></button>
                    <button class="videocall_icon" value=1 id=${data.item} type="button"  onclick="clicked(event)" ></button>
                </div>
            </div>`
            return;


        case "answer":
            peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            ice_arr.forEach((i)=>{
                peerConnection.addIceCandidate(new RTCIceCandidate(i));
            })
            connection.send(JSON.stringify({
                type: "ready"
            }));
            return;
        



    }
    
    


}




function accept_call_chat(event){

}
function decline_call_chat(event){

}
function accept_call_viedio(event){

}
function decline_call_viedio(event){

}


function accept_call_chat(event){
   // alert("dojnjjjnoinoi=======================||")
    let popup=document.getElementsByClassName('calling_popup_chat')[0]
    popup.style.visibility="hidden";
    var temp = document.getElementsByClassName('chat_space')[0]
    temp.style.visibility="visible";

    var data=DATA_G;
    conn_offer=data.offer;
    var user2=data.from;
    var me=data.to;
    var k=data.k
    make_answer(me,user2,k);
    
    
}
function decline_call_chat(event){
    var data=DATA_G;
    connection.send(JSON.stringify({type:"declined",from:data.to,to:data.from}))
    let popup=document.getElementsByClassName('calling_popup_chat')[0]
    popup.style.visibility="hidden";

}

function accept_call_viedio(event){
    let popupx=document.getElementsByClassName('calling_popup_viedio')[0]
    popupx.style.visibility="hidden"
    var tempx = document.getElementsByClassName('viedio_call_space')[0]
    tempx.style.visibility="visible";

    var data=DATA_G;
    conn_offer=data.offer;
    var user2=data.from;
    var me=data.to;
    var k=data.k;
    make_answer(me,user2,k);
    
        
}

function decline_call_viedio(event){
    var data=DATA_G;
    connection.send(JSON.stringify({type:"declined",from:data.to,to:data.from}))
    let popup=document.getElementsByClassName('calling_popup_viedio')[0]
    popup.style.visibility="hidden";
}
function declined(event){
    var temp = document.getElementsByClassName('chat_space')[0]
    temp.style.visibility="hidden";

    let popup=document.getElementsByClassName('viedio_call_space')[0]
            popup.style.visibility="hidden";
            if(localStream){
                localStream.getTracks().forEach(function(track) {
                    track.stop();
                  });
            }
    let popupx=document.getElementsByClassName('declined_popup')[0]
    popupx.style.visibility="hidden";
}

function end_call(event){
    peerConnection.close();
    connection.send(JSON.stringify({type:"viedio_call_close",to:user2_g}))
    user2_g=null;
    localStream.getTracks().forEach(function(track) {
        track.stop();
      });
    var temp = document.getElementsByClassName('viedio_call_space')[0]
    temp.style.visibility="hidden";
    k=undefined;
}

function mute_audio(event){
    localStream.getTracks().forEach(function(track) {
        if(track.kind=="audio"){
            track.enabled=false;
            console.log("audio muted")
        document.getElementsByClassName('mute_audio')[0].setAttribute("onclick","unmute_audio(event)")
        document.getElementsByClassName('mute_audio')[0].style.backgroundImage="url('../static/images/unmute_mic_icon.jpg')"
        }

      });

}

function unmute_audio(event){
    localStream.getTracks().forEach(function(track) {
        if(track.kind=="audio"){
            track.enabled=true;
            console.log("audio unmuted")
        document.getElementsByClassName('mute_audio')[0].setAttribute("onclick","mute_audio(event)")
        document.getElementsByClassName('mute_audio')[0].style.backgroundImage="url('../static/images/mute_mic_icon.jpg')"
        }

      });

}

function mute_video(event){
    localStream.getTracks().forEach(function(track) {
        if(track.kind=="video"){
            track.enabled=false;
            console.log("vidio muted")
        document.getElementsByClassName('mute_video')[0].setAttribute("onclick","unmute_video(event)")
        document.getElementsByClassName('mute_video')[0].style.backgroundImage="url('../static/images/unmute_viedio_icon.jpg')"
        }

      });
}

function unmute_video(event){
    localStream.getTracks().forEach(function(track) {
        if(track.kind=="video"){
            track.enabled=true;
            console.log("vidio unmuted")
        document.getElementsByClassName('mute_video')[0].setAttribute("onclick","mute_video(event)")
        document.getElementsByClassName('mute_video')[0].style.backgroundImage="url('../static/images/mute_viedio_icon.jpg')"
        }

      });
}



function clicked(event){
    event.preventDefault();
    var x=event.target;
    var k=x.value;

    console.log("sessionuser==:>",session_userid)

    var user2=x.id;
    connection.send(JSON.stringify({type:"message",from:session_userid,to:user2}))
    //var cook=getCookie("session_token");
    rtc_conn_chat(user2,session_userid,k);

    if(k==0){
    var temp = document.getElementsByClassName('chat_space')[0]
    temp.style.visibility="visible";
    }
    else if(k==1){
        var temp = document.getElementsByClassName('viedio_call_space')[0]
        temp.style.visibility="visible";
    }
    
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


 //=============================================================================================================================================
 //=======================================================||(STYLING)||=====================================================================================
 //================================================================================================================================================================

 var menu=document.getElementsByClassName("menu")[0];

 menu.addEventListener("mouseover",()=>{
     var profilecontainer=document.getElementsByClassName("profilecontainer")[0];
     
     profilecontainer.addEventListener("mouseover",()=>{
        profilecontainer.style.height="40em";
        profilecontainer.style.backgroundColor="#220606e0"
        menu.style.transform="rotate(45deg)"
     })
     
     profilecontainer.addEventListener("mouseout",()=>{
        var profilecontainer=document.getElementsByClassName("profilecontainer")[0];
        profilecontainer.style.height="96%";
        profilecontainer.style.backgroundColor="#ffffff00"
        menu.style.transform="rotate(0deg)"
             
    })


 })


 


 //==========================================================================================================================================//=
 //========================================================||(STYLING)||=============================================================================
 //===============================================================================================================================================
 

   function create_webrtc_intial_connection(user2,useridx,k) {
    user2_g=user2;

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
    peerConnection.onclose=peer_conn_close;

    //getting permission snd streaming first
    
    //adding streams to the wrtc

    //=========================================================================================================================================
    //=========================================================================================================================================
    if(k==1){
    remoteStream=new MediaStream();
    document.getElementById('user2stream').srcObject=remoteStream;

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

}


//same fun second time for user2


function create_webrtc_intial_connection2(user2,useridx) {
    user2_g=user2;

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

    peerConnection.onclose=peer_conn_close;


    peerConnection.oniceconnectionstatechange = handlestatechangeCallback;
    peerConnection.onnegotiationneeded = handleonnegotiatioCallback;

     //getting permission snd streaming first
    
    //adding streams to the wrtc

    
}

var peer_conn_close=function(){
    alert("peerconn closed")
    console.log("peer connection closed")
}






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
    if (Send_dataChannel.readyState == "open") {
        /* */
    }
};
/**
 * This function will handle the data channel message callback.
 */
 var onSend_ChannelMessageCallback = function (event) {
    console.log("send-dataChannel.OnMessage:", event);
    document.getElementsByClassName("messages")[0].innerHTML=`${(document.getElementsByClassName("messages")[0].innerHTML)}`+
           `<div class="messages_right">
            <p id="message_right">${event.data}</p>
            </div>`
            var elem = document.getElementsByClassName('messages')[0];
            elem.scrollTop = elem.scrollHeight;
   
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



async function creating_offer(user2,useridx,k) {

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
            from:useridx,
            k:k
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




async function make_answer(a,b,k) {
   
    //add tracks from user2 premissin
     //getting permission snd streaming first
    

    
    //remoteStream=new MediaStream();
    //document.getElementById('user2').srcObject=remoteStream;
    //create RTC peer connection from receive end
    //create a data channel bind
    create_webrtc_intial_connection2(b,a);
     
    if(k==1){
    localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true})
    document.getElementById('user1stream').srcObject=localStream;

    remoteStream=new MediaStream();
    document.getElementById('user2stream').srcObject=remoteStream;
    
   }

    peerConnection.ondatachannel = receiveChannelCallback;
    peerConnection.setRemoteDescription(new RTCSessionDescription(conn_offer));
    ice_arr.forEach((i)=>{
        peerConnection.addIceCandidate(new RTCIceCandidate(i));
    })
   if(k==1){

       localStream.getTracks().forEach((track) => {
       peerConnection.addTrack(track,localStream);
      
    });
        

   peerConnection.ontrack=(event)=>{
        console.log(event)
        event.streams[0].getTracks().forEach((track)=>{
           remoteStream.addTrack(track)
        })
        if(!remoteStream.getTracks()){
            console.log("remstream==nu;;")
        }
        console.log(remoteStream)

    }

       }


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
    
    if (Receive_dataChannel.readyState == "open") {
        
        /* */
    }
};

var onReceive_ChannelMessageCallback = function (event) {
    console.log("recieve-dataChannel.OnMessage:", event);
    console.log(document.getElementById("message_right"))
    document.getElementsByClassName("messages")[0].innerHTML=(document.getElementsByClassName("messages")[0].innerHTML+
    `<div class="messages_right">
    <p id="message_right">${event.data}</p>
    </div>`)
    var elem = document.getElementsByClassName('messages')[0];
     elem.scrollTop = elem.scrollHeight;
   

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


const textbox = document.getElementById("message_form");
textbox.addEventListener("keypress", function onEvent(event) {
    if (event.key === "Enter") {
        event.preventDefault()
        document.getElementsByClassName("send_message")[0].click();
    }
});

function send_text(event){
    var data_channel;
    if(flag_send_datachannel){
        data_channel=Send_dataChannel;
    }else{
        data_channel=Receive_dataChannel;
    }

    let v=new FormData(message_form)
    const values = [...v.entries()];
    console.log("vals=>",values)
    var txt=values[0][1];
    console.log(txt)
    if(txt){
    data_channel.send(txt);
    document.getElementsByClassName("messages")[0].innerHTML=(document.getElementsByClassName("messages")[0].innerHTML+
    `<div class="m_left">
    <div class="messages_left">
    <p id="message_left">${txt}</p>
    </div>
    </div>`)
     var elem = document.getElementsByClassName('messages')[0];
     elem.scrollTop = elem.scrollHeight;  
    };
    var inputbox=document.getElementById('message_form').reset()
    

}


function leave_room(event){
    if(flag_send_datachannel){
        Send_dataChannel.close();}
        else{
            Receive_dataChannel.close();
        }        
        peerConnection.close();
        connection.send(JSON.stringify({type:"room_close",to:user2_g}))
        user2_g=null;
        var temp = document.getElementsByClassName('chat_space')[0]
        temp.style.visibility="hidden";
        document.getElementsByClassName("messages")[0].innerHTML=" ";
        k=undefined;
        
    }


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





async function rtc_conn_chat(user2,useridx,k){
    if(k==1){
    localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    document.getElementById('user1stream').srcObject=localStream;}
    //moving on to connections
    create_webrtc_intial_connection(user2,useridx,k);
    if(k==0){
    Create_DataChannel(user2);
    }
    creating_offer(user2,useridx,k)

}



function showmsg(x){
    console.log("msg from datachannel====>",x)
    alert(x);
}
  
   
    
    

