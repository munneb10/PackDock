"""                             Api
                        to manage the container 
"""
import stat
from urllib import response
import flask 
from flask import jsonify,request
import random
import string
from TerminalHandler.handle_terminal import TerStatus
from flask_cors import CORS
app = flask.Flask(__name__)
CORS(app)
app.config["DEBUG"] = True
commandExecPool={}
def get_random_string(length):
    # choose from all lowercase letter
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(length))
    return result_str
# Create Container Api
@app.route('/createContainer', methods=['GET'])
def createContainer(): 
    from PackDockApi.handlecontainerApi.handleContainer import createContainer
    conId=createContainer()
    res={"containerId":conId}
    if conId is None:
        return jsonify(res),500
    return jsonify(res),200

# Run Container Api
@app.route('/runContainer', methods=['GET'])
def runContainer(): 
    if 'conId' in request.args:
        from PackDockApi.handlecontainerApi.handleContainer import runContainer
        response=runContainer(request.args['conId'])
        res={"running":response}
        if not response:
            return jsonify(res),500
        return jsonify(res),200
    return jsonify({"message":"Please send Id"}),400

# Remove Container Api
@app.route('/removeContainer', methods=['GET'])
def removeContainer(): 
    if 'conId' in request.args:
        from PackDockApi.handlecontainerApi.handleContainer import removeContainer
        response=removeContainer(request.args['conId'])
        res={"removed":response}
        if not response:
            return jsonify(res),500
        return jsonify(res),200
    return jsonify({"message":"Please send Id"}),400

# Run Terminal Command Api
@app.route('/runCommand', methods=['GET'])
def runCommand(): 
    if 'conId' in request.args and 'command' in request.args:
        from PackDockApi.handleTerminalApi.handleTerminal import runCommand
        TerHand=runCommand(request.args['conId'],request.args['command'])
        if TerHand:
            execCmdId=get_random_string(10)
            while execCmdId in commandExecPool.keys():
                execCmdId=get_random_string(10)
            commandExecPool[execCmdId]=TerHand
            return jsonify({"cmdId":execCmdId})
    return jsonify({"message":"Please send conId or command"})

# Get output api req : need command id that is executing
@app.route('/getCommandOutput', methods=['GET'])
def getCommandOutput():
    if 'cmdId' in request.args:
        cmdId=request.args['cmdId']
        if cmdId in commandExecPool.keys():
            def onData(gotData,status):
                global data
                data=gotData
                global statu
                statu=status
                if commandExecPool[cmdId].status==TerStatus.COMPLETED:
                    commandExecPool.pop(cmdId)
            commandExecPool[cmdId].getOutput(1000,onData)
            return {"output":data,"status":statu},200
        else:
            return "Not valid command id"
@app.route('/sendCommandInput', methods=['GET'])
def sendCommandInput():
    if 'cmdId' in request.args and 'input' in request.args:
        cmdId=request.args['cmdId']
        input=request.args['input']
        if cmdId in commandExecPool.keys():
            commandExecPool[cmdId].sendInput(input)
            return {"status":commandExecPool[cmdId].status.name},200
        else:
            return "Not valid command id"
def run():
    app.run()