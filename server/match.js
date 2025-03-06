function match(){
    let findName = "Name Name"//document.getElementById("name").value;
    let names = ["Name Name"];
    let opts = ["event 1 - info", "event 2 - info"];
    let nameFound = false;
    let skills = ["skill1", "skill2"];
    let prefs = ["pref1", "pref2"]
    
    for (let name in names){
        if (findName == names[name]){
            nameFound = true;
        }
    }
    if(nameFound == true){
        for (let skill in skills){
            //document.getElementById("skills").innerText="Skills: " + skills.join(", ");
        }
        for (let pref in prefs){
            //document.getElementById("prefs").innerText = "Preferences: " + prefs.join(", ");
        }
        //let choices = document.getElementById("evSelector");
        //choices.innerHTML="";
        for (let opt in opts){
            //let option = document.createElement("option");
            //option.textContent = opts[opt];
            //option.value = opts[opt];
            //choices.appendChild(option);
        }
    }
    else{
        alert("Cannot Find Volunteer Name.");
    }
    return findName;
}
module.exports=match;

function sendEvent(){
    let eventMatched = document.getElementById("evSelector").value;
    if(eventMatched){
        alert("Matched Event Submitted.");
    }
    else{
        alert("No Event Selected.");
    }
}
