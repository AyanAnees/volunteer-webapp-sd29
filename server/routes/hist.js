function loadHistory(){
    let eventNames = ["Hospital Volunteering", "Earthquake Relief"];
    let eventDescriptions = ["volunteer at the hospital", "volunteer to help relieve the earthquake"];
    let eventLocation = ["TX" , "CA"];
    let eventSkills = ["Healthcare & Social Services", "Disaster Relief"];
    let eventUrgency = ["medium", "high"];
    let eventDate = ["3/4/2025" , "3/5/2025"];
    let eventStatus = ["participated", "upcoming"];;
    const table = document.getElementById("hist");
    for (let name in eventNames){
        let tr = document.createElement("tr");
        let tdName = document.createElement("td");
        let tdDesc = document.createElement("td");
        let tdLocate = document.createElement("td");
        let tdSkill = document.createElement("td");
        let tdUrg = document.createElement("td");
        let tdDate = document.createElement("td");
        let tdStatus = document.createElement("td");
        
        tdName.innerText = eventNames[name];
        tdDesc.innerText = eventDescriptions[name];
        tdLocate.innerText = eventDescriptions[name];
        tdSkill.innerText = eventSkills[name];
        tdUrg.innerText = eventUrgency[name];
        tdDate.innerText = eventDate[name];
        tdStatus.innerText = eventStatus[name];

        tr.appendChild(tdName);
        tr.appendChild(tdDesc);
        tr.appendChild(tdLocate);
        tr.appendChild(tdSkill);
        tr.appendChild(tdUrg);
        tr.appendChild(tdDate);
        tr.appendChild(tdStatus);

        table.appendChild(tr);
    }
}