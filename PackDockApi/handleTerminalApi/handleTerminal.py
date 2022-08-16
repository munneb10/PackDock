from TerminalHandler.handle_terminal import TerHandler
def runCommand(conId,command):
    TerHand=TerHandler(conId=conId)
    status=TerHand.runTerminalCommand(command=command)
    if not status:
        return None
    return TerHand
# def runContainer(conId):
#     conMan=containerManager()
#     response=conMan.runContainer(conId)
#     if response:
#         return True
#     return False
# def removeContainer(conId):
#     conMan=containerManager()
#     response=conMan.removeContainer(conId)
#     if response:
#         return True
#     return False