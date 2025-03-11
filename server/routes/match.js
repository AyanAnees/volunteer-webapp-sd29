function match(){
    //TO DISPLAY HTML, UNCOMMENT BELOW!
    //TO TEST, COMMENT JS THAT CONTAINS "document"
    let findName = document.getElementById("name").value;//"Name Name"//
    let names = ["Name Name"];
    let opts = ["event 1 - info", "event 2 - info", "event 3 - info"];
    let nameFound = false;
    let skills = ["skill1", "skill2"];
    let eventReq = ["skill1", "skill2", "skill3"];
    let prefs = ["pref1", "pref2"]
    
    if(findName.length >= 100 || findName.length < 4 || !/^[A-Za-z]+ [A-Za-z]+$/.test(findName)){
        if(findName.length >= 100){
            alert("Name cannot be more than 100 characters. You must enter a valid name. Please try again!");
        }
        else if(findName.length < 4){
            alert("Name cannot be less than 4 characters. You must enter a valid name. Please try again!");
        }
        else if (!/^[A-Za-z]+ [A-Za-z]+$/.test(findName)){
            alert("Name cannot contain non-alphabet characters and must be in format: firstName lastName . Please try again!");
        }
        //alert("You must enter a valid name. Please try again!");
        throw new Error('Invalid name');
    }

    for (let name in names){
        if (findName == names[name]){
            nameFound = true;
        }
    }
    if(nameFound == true){
        for (let skill in skills){
            document.getElementById("skills").innerText="Skills: " + skills.join(", ");
        }
        for (let pref in prefs){
            document.getElementById("prefs").innerText = "Preferences: " + prefs.join(", ");
        }
        let choices = document.getElementById("evSelector");
        choices.innerHTML="";
        for (let req in eventReq){
            for(let skill in skills){
                if(eventReq[req] == skills[skill]){
                    let option = document.createElement("option");
                    option.textContent = opts[req];
                    option.value = opts[req];
                    choices.appendChild(option);
                }
            }
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
