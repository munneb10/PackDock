from containerHandlers.handle_container import containerManager
def createContainer():
    conMan=containerManager()
    conId=conMan.createContainer()
    return conId
def runContainer(conId):
    conMan=containerManager()
    response=conMan.runContainer(conId)
    if response:
        return True
    return False
def removeContainer(conId):
    conMan=containerManager()
    response=conMan.removeContainer(conId)
    if response:
        return True
    return False