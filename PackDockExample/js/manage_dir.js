// in the begining the current directory 
let current_dir = "/"
const noRightClick = document.getElementById("View");
document.getElementsByTagName("body")[0].addEventListener("contextmenu",(e)=>{    
    e.preventDefault();
})
let dialogOpen=false;
let selected=""
let type=""
let newFileContent="";
let fileContent = ""
let openedFile=""
noRightClick.addEventListener("mousedown", (e)=>{
    // e.preventDefault();
    if (e.target.name=="file" || e.target.name=="folder") {
        selected=e.target.value;
        type=e.target.name;           
    }else{
        if (e.button==0) {
            if (dialogOpen==true) {
                document.getElementById("dialog").style.visibility="hidden"
            }
            return;
        }
        showDialog(e)
    }
    
});
// just has taken the default continer we can also create the container 
// container for every single user 
let containerId = "cade7a1c0023"
const getFilDirList = async (e,conSym=false) => {
    e.preventDefault()
    if (e.button==2) {
        showDialog(e)
        return;
    }
    if (dialogOpen==true) {
        document.getElementById("dialog").style.visibility="hidden"
    }
    let element = e.target
    if (element.name == "folder") {
        current_dir += element.value
        await changeDirStatus(current_dir)
    } else {        
        cmdId = await runCommand(`cat ${current_dir}${element.value}`, containerId)
        openedFile=element.value;
        data = await getCommandOutput(cmdId)
        fileContent = data.output
        while (data.status != "COMPLETED") {
            data = await getCommandOutput(cmdId)
            fileContent += data.output
        }
        fileContent = fileContent.replace(`--completed_command_${containerId}`,"")
        newFileContent=fileContent;
        document.getElementById("dirFilePreview").innerHTML = ""
        cm = CodeMirror(document.getElementById('dirFilePreview'), {
            lineNumbers: true,
            theme: 'monokai',
            value:fileContent,                         
        });
        cm.on("change",function (cont,change) {
            newFileContent=cont.getValue();
         })
        cm.setSize("100%", "100%")
        let buttonDiv=document.createElement('div');
        let saveButton=document.createElement('button');
        saveButton.innerText="Save Changes";
        saveButton.id="button"        
        buttonDiv.classList.add("center")
        saveButton.addEventListener("click",SaveContent)
        buttonDiv.appendChild(saveButton)
        document.getElementById("dirFilePreview").insertAdjacentElement('afterbegin',buttonDiv)
    }

}
const SaveContent=async()=>{
if (newFileContent!=fileContent) {
    cmdId = await runCommand(`echo "${newFileContent}" > ${current_dir}${openedFile}`, containerId)
    let data = await getCommandOutput(cmdId)
    let cmdoutput = data.output
    while (data.status != "COMPLETED") {
        data = await getCommandOutput(cmdId)
        cmdoutput += data.output
    }
    cmdoutput = cmdoutput.replace(`--completed_command_${containerId}`,"")
    alert("content changed");
}else{
    alert("Please change the content");
}
}
const normalizeToHtml = (list) => {
    let allList = list.split("\n")
    if (allList[0] == "undefined" && allList[1] == "") {
        document.getElementById("dirFilePreview").innerHTML = "<p style='color:black;'>No Files Exist</p>"
        return;
    }
    let tagList = ""
    for (let index = 0; index < allList.length; index++) {
        if (!allList[index] || allList[index] == "undefined") {
            continue
        }
        if (allList[index].includes("/")) {
            allList[index] = allList[index].replace("/", "")
            tagList += `<div id="Preview">
            <img src="./images/folder.png" alt="">
            <button id="dirStyle"  onmousedown="getFilDirList(event)" name="folder" value="/${allList[index]}"/>${allList[index]}</button>
          </div>`
            continue
        } else if (allList[index].includes("*")) {
            allList[index] = allList[index].replace("*", "")
        } else if (allList[index].includes("@")) {

            allList[index] = allList[index].replace("@", "")
            tagList += `<div id="Preview">
            <img src="./images/folder.png" alt="">
            <button id="dirStyle"  onmousedown="getFilDirList(event,true)" name="folder" value="/${allList[index]}"/>${allList[index]}</button>
          </div>`
            continue
        }
        tagList += `<div id="Preview">
       <img src="./images/file.png" alt="">
       <button name="file" id="dirStyle" onmousedown="getFilDirList(event)" value="/${allList[index]}">${allList[index]}</button>
     </div>`
    }
    document.getElementById("dirFilePreview").innerHTML = tagList
    document.getElementById("dirStatusPreview").value = current_dir
}
const deleteSel=()=>{
    document.getElementById("dialog").style.visibility="hidden"
    if (type=="file" || type=="folder") {
        let name=type=="file"?selected.split('/')[1]:selected.split('/')[0];
        delFileFolder(name,type);
    }
}
let copiedPath="";
let copiedType="";
let copiedName="";
let cut=false;
const cutSel=()=>{
    cut=true;
    copiedPath=current_dir;
    document.getElementById("dialog").style.visibility="hidden"
    if (type=="file" || type=="folder") {
        let name=type=="file"?selected.split('/')[1]:selected.split('/')[0];
        // copyFileFolder(name,type);
        copiedName=name;
        copiedType=type;
    }
}
const copySel=()=>{
    copiedPath=current_dir;
    cut=false;
    document.getElementById("dialog").style.visibility="hidden"
    if (type=="file" || type=="folder") {
        let name=type=="file"?selected.split('/')[1]:selected.split('/')[0];
        // copyFileFolder(name,type);
        copiedName=name;
        copiedType=type;
    }
}
const pasteSel=()=>{
    let pastePath=current_dir;
    if (pastePath==copiedPath) {
        document.getElementById("dialog").style.visibility="hidden"
        alert("Please paste on the different");
        return;
    }
    pasteFileFolder(pastePath);
}
const pasteFileFolder=async(pastePath)=>{
    document.getElementById("dialog").style.visibility="hidden"
    let cutOrcopy=cut?"mv":"cp";
    let option=cut?"":"-rf";
    cmdId = await runCommand(`${cutOrcopy} ${option} ${copiedPath}/${copiedName} ${pastePath}`, containerId)
    let data = await getCommandOutput(cmdId)
    let cmdoutput = data.output
    while (data.status != "COMPLETED") {
        data = await getCommandOutput(cmdId)
        cmdoutput += data.output
    }
    await changeDirStatus(current_dir)
    cmdId = await runCommand(`ls ${pastePath} | grep ${copiedName}`, containerId)
    let chdata = await getCommandOutput(cmdId)
    let chcmdoutput = chdata.output
    while (data.status != "COMPLETED") {
        chdata = await getCommandOutput(cmdId);
        chcmdoutput += chdata.output;
    }
    chcmdoutput = chcmdoutput.replace(`--completed_command_${containerId}`,"")
    if (chcmdoutput.trim()==copiedName) {
        alert(`${copiedName} pasted successfully`);
    }
}

const delFileFolder=async(name,type)=>{
    cmdId = await runCommand(`cd ${current_dir};rm -rf ${name}`, containerId)
    let data = await getCommandOutput(cmdId)
    let cmdoutput = data.output
    while (data.status != "COMPLETED") {
        data = await getCommandOutput(cmdId)
        cmdoutput += data.output
    }
    await changeDirStatus(current_dir)
    cmdId = await runCommand(`ls ${current_dir} | grep ${name}`, containerId)
    let chdata = await getCommandOutput(cmdId)
    let chcmdoutput = chdata.output
    while (data.status != "COMPLETED") {
        chdata = await getCommandOutput(cmdId)
        chcmdoutput += chdata.output
    }
    chcmdoutput = chcmdoutput.replace(`--completed_command_${containerId}`,"")
    if (chcmdoutput.trim()=="") {
        alert(`${name} ${type} deleted successfully`)
    }
}
window.onload = async () => {
    onRun = (conStatus) => {
        if (!conStatus) {
            alert("Service is Down")
        }
    }
    runContainer(onRun)
    changeDirStatus("/")
}

const changeDirStatus = async (location) => {
    let details = await getDirStatus(location)
    normalizeToHtml(details)
}

const getDirStatus = async (location) => {
    cmdId = await runCommand(`cd ${location};ls -1F`, containerId)
    let data = await getCommandOutput(cmdId)
    let cmdoutput = data.output
    while (data.status != "COMPLETED") {
        data = await getCommandOutput(cmdId)
        cmdoutput += data.output
    }
    cmdoutput = cmdoutput.replace(`--completed_command_${containerId}`,"")
    return cmdoutput
}

const moveBackDir = async () => {
    dir = current_dir.split("/")
    dir.pop()
    current_dir = dir.join("/")
    if (current_dir == "") {
        current_dir = "/"
    }
    await changeDirStatus(current_dir)
}

const createFile=async()=>{
    fileName=prompt("Enter the file name")
    cmdId = await runCommand(`cd ${current_dir};touch ${fileName}`, containerId)
    let data = await getCommandOutput(cmdId)
    let cmdoutput = data.output
    while (data.status != "COMPLETED") {
        data = await getCommandOutput(cmdId)
        cmdoutput += data.output
    }
    await changeDirStatus(current_dir)
    cmdId = await runCommand(`ls ${current_dir} | grep ${fileName}`, containerId)
    let chdata = await getCommandOutput(cmdId)
    let chcmdoutput = chdata.output
    while (data.status != "COMPLETED") {
        chdata = await getCommandOutput(cmdId)
        chcmdoutput += chdata.output
    }
    chcmdoutput = chcmdoutput.replace(`--completed_command_${containerId}`,"")
    if (fileName.trim() == chcmdoutput.trim()) {
        alert("File successfully created")
    }
}
const showDialog=(e)=>{
selected=e.target.value;
dialogOpen=true;
let dialog=document.getElementById("dialog")
dialog.style.left=`${e.clientX}px`
dialog.style.top=`${e.clientY}px`
dialog.style.visibility="visible"
document.getElementById("dialogHelper").innerHTML=""
document.getElementById("dialogHelper").appendChild(dialog)
}
const createFolder=async(e)=>{
    folderName=prompt("Enter the folder name")
    cmdId = await runCommand(`cd ${current_dir};mkdir ${folderName}`, containerId)
    let data = await getCommandOutput(cmdId)
    let cmdoutput = data.output
    while (data.status != "COMPLETED") {
        data = await getCommandOutput(cmdId)
        cmdoutput += data.output
    }
    await changeDirStatus(current_dir)
    cmdId = await runCommand(`ls ${current_dir} | grep ${folderName}`, containerId)
    let chdata = await getCommandOutput(cmdId)
    let chcmdoutput = chdata.output
    while (data.status != "COMPLETED") {
        chdata = await getCommandOutput(cmdId)
        chcmdoutput += chdata.output
    }
    chcmdoutput = chcmdoutput.replace(`--completed_command_${containerId}`,"")
    if (folderName.trim() == chcmdoutput.trim()) {
        alert("Folder successfully created")
    }
}