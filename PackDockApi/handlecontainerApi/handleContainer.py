from containerHandlers.handle_container import containerManager
def createContainer():
        conMan=containerManager()
        conId=conMan.createContainer()
        return conId