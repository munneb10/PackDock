// in the begining the current directory 
let current_dir = "/"
const noRightClick = document.getElementById("dirFilePreview");
document.getElementById("View").addEventListener("click",()=>{
    if (dialogOpen==true) {
        document.getElementById("dialog").style.visibility="hidden"
    }
})
let dialogOpen=false;
let selected=""
noRightClick.addEventListener("contextmenu", e => e.preventDefault());
// just has taken the default continer we can also create the container 
// container for every single user 
let containerId = "cade7a1c0023"
const getFilDirList = async (e) => {
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
        current_dir += element.value + "/"
        await changeDirStatus(current_dir)
    } else {
        let fileContent = ""
        cmdId = await runCommand(`cat ${current_dir}${element.value}`, containerId)
        data = await getCommandOutput(cmdId)
        fileContent = data.output
        while (data.status != "COMPLETED") {
            data = await getCommandOutput(cmdId)
            fileContent += data.output
        }
        fileContent = fileContent.replace(`--completed_command_${containerId}`,"")
        document.getElementById("dirFilePreview").innerHTML = ""
        console.log(document.getElementById('dirFilePreview'));
        cm = CodeMirror(document.getElementById('dirFilePreview'), {
            lineNumbers: true,
            theme: 'monokai',
            value:fileContent
        });
        cm.setSize("100%", "100%")
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
            <button id="dirStyle" onmousedown="getFilDirList(event)" name="folder" value="${allList[index]}"/>${allList[index]}</button>
          </div>`
            continue
        } else if (allList[index].includes("*")) {
            allList[index] = allList[index].replace("*", "")
        } else if (allList[index].includes("@")) {
            allList[index] = allList[index].replace("@", "")
            tagList += `<div id="Preview">
            <img src="./images/folder.png" alt="">
            <button id="dirStyle" onmousedown="getFilDirList(event)" name="folder" value="${allList[index]}"/>${allList[index]}</button>
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
    console.log(selected);
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
    cmdId = await runCommand(`ls ${location} -1F`, containerId)
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
    let currenDir = document.getElementById("dirStatusPreview").value
    dir = current_dir.split("/")
    dir.pop()
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
console.log(e.target.name);
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