var men=document.getElementsByClassName("menu")[0];

men.addEventListener("mouseover",()=>{
    var profilecontainer=document.getElementsByClassName("profilecontainer")[0];
    profilecontainer.style.height="10em";

})
men.addEventListener("mouseout",()=>{
    var profilecontainer=document.getElementsByClassName("profilecontainer")[0];
    profilecontainer.style.height="96%";

})