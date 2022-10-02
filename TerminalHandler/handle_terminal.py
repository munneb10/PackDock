from distutils.log import error
from enum import Enum
import select
class TerStatus(Enum):
    COMPLETED="completed"
    RUNNING="running"
    FAILED="failed"
    PENDING="pending"
    INITIAL="initial"  
class TerHandler: 
    def __init__(self,conId):
        self.output=""
        self.data=None
        self.conId=conId
        self.status=TerStatus.INITIAL
    def setupContainer(self):
        from containerHandlers.handle_container import containerManager
        ex=containerManager().containerExist(self.conId)
        if not ex:
            return False
        runningContainer=containerManager().runContainer(self.conId)
        if runningContainer is not None:
            self.container=runningContainer
            return True
        return False
    def runTerminalCommand(self,command):
        if not self.setupContainer() or command=="":
            return False
        try:
            _,cmdHandler =self.container.exec_run(["bash","-c",command+";"+f"echo --completed_command_{self.conId}"],stream=True,tty=True,stdin=True,socket=True)
            cmdHandler._sock.setblocking(False)
            self.cmdSocket=cmdHandler._sock
            self.status=TerStatus.RUNNING
            return True
        except Exception as e:
            self.status=TerStatus.FAILED
            return None
    def getOutput(self,noOfBytes,onData):
        if self.status==TerStatus.INITIAL or self.status==TerStatus.COMPLETED:
            onData("There is no running command")
            return
        ack,_,_=select.select([self.cmdSocket],[],[],1)
        try:
            self.data=self.cmdSocket.recv(noOfBytes)
            decodedData=self.data.strip(b'\r').decode('utf-8',errors='ignore').replace('\r','')
            if f"--completed_command_{self.conId}" in self.output:
                self.status=TerStatus.COMPLETED
            if self.status==TerStatus.COMPLETED:
                decodedData=decodedData.replace(f"--completed_command_{self.conId}","")
            else:
                self.status=TerStatus.RUNNING
            self.output+=decodedData
            onData(decodedData,self.status.name)
        except Exception as e:
            if e.errno==11:
                self.status=TerStatus.PENDING
                return ""
    def sendInput(self,input):
        inp=f"{input}\n"
        ByteInp=bytes(inp, 'utf-8')
        self.cmdSocket.sendall(ByteInp)
        self.status=TerStatus.RUNNING