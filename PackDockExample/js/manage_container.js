const runContainer = (onRun) => {
    const params = new URLSearchParams([['conId', containerId]]);
    axios({
        method: 'get',
        url: 'http://127.0.0.1:5000/runContainer',
        params: params
    })
        .then(function (response) {
            if (response.data.running == true) {
                onRun(true)
            } else {
                onRun(false)
            }
        });
}
const runCommand = async (command, conId) => {
    const params = new URLSearchParams([['conId', conId], ['command', command]]);
    let response = await axios({
        method: 'get',
        url: 'http://127.0.0.1:5000/runCommand',
        params: params
    })
    if (response.data.cmdId) {
        return response.data.cmdId
    } else {
        return ""
    }
}

const getCommandOutput =async (commandId) => {
    const params = new URLSearchParams([['cmdId', commandId]]);
    let response =await axios({
        method: 'get',
        url: 'http://127.0.0.1:5000/getCommandOutput',
        params: params
    })
    if (response.data) {
        return response.data
    } else {
        return {}
    }
}
const getCommandStatus=async(commandId)=>{
    const params = new URLSearchParams([['cmdId', commandId]]);
    let response =await axios({
        method: 'get',
        url: 'http://127.0.0.1:5000/getCommandStatus',
        params: params
    })
    if (response.data) {
        return response.data.status
    } else {
        return {}
    }
}
const removeCompletedCommand=async(commandId)=>{
    const params = new URLSearchParams([['cmdId', commandId]]);
    let response =await axios({
        method: 'get',
        url: 'http://127.0.0.1:5000/removeCompletedCommand',
        params: params
    })
    if (response.data) {
        return response.data.status
    } else {
        return {}
    }
}