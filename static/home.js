var connection =new WebSocket('ws://localhost:8886');



var cook=getCookie("session_token");
if(!sessionStorage.getItem("userid")){
var sess=sessionStorage.setItem("userid",cook)}

session_userid=sessionStorage.getItem("userid");



console.log(connection)
connection.onopen=function(){
    connection.send(JSON.stringify({type:"hello",x:"eee"}))
}




let formx=document.getElementById("login_form");


formx.addEventListener("submit",function(event){

   


    //event.preventDefault()
    
    let v=new FormData(formx)
    const values = [...v.entries()];
    console.log(values)

    var name=values[0][1];
    var password=values[1][1];

    connection.send(JSON.stringify({type:'login',user:name,password:password}));
    alert("user logged in");
})



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


