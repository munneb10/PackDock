"""Api to run terminal commands 
(it means you can do what ever you want instead of GUI Task
 you can use this to setup the Technology testing enviornment
and you can do any language testing and learning through this without 
any much hustle in your machine your machine will remain clean) """
import flask 
from flask import jsonify
app = flask.Flask(__name__)
app.config["DEBUG"] = True


@app.route('/createContainer', methods=['GET'])
def createContainer(): 
    from PackDockApi.handlecontainerApi.handleContainer import createContainer
    conId=createContainer()
    res={"containerId":conId}
    if conId is None:
        return jsonify(res),400
    return jsonify(res),200
def run():
    app.run()