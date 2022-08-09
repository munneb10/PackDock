from enum import Enum
import select
class TerHandler:
    class TerStatus(Enum):
        COMPLETED="completed"
        RUNNING="running"
        FAILED="failed"
        PENDING="pending"
        INITIAL="initial"   
    def __init__(self,conId):
        self.output=""
        self.data=None
        self.conId=conId
        self.status=self.TerStatus.INITIAL
    def setupContainer(self):
        from containerHandlers.handle_container import containerManager
        runningContainer=containerManager().runContainer(self.conId)
        if runningContainer is not None:
            self.container=runningContainer
            return True
        return False
    def runTerminalCommand(self,command):
        if not self.setupContainer() or command=="":
            return False
        try:
            _,cmdHandler =self.container.exec_run(command,stream=True,tty=True,stdin=True,socket=True)
            cmdHandler._sock.setblocking(False)
            self.cmdSocket=cmdHandler._sock
            self.status=self.TerStatus.RUNNING
        except Exception as e:
            self.status=self.TerStatus.FAILED
    def getOutput(self,noOfBytes,onData):
        if self.status==self.TerStatus.INITIAL or self.status==self.TerStatus.COMPLETED:
            print("There is no running command")
        while True:
            ack,_,_=select.select([self.cmdSocket],[],[],1)
            try:
                self.data=self.cmdSocket.recv(noOfBytes)
                if(self.data==b''):
                    self.status=self.TerStatus.COMPLETED
                    return self.output
                decodedData=self.data.strip(b'\r').decode('utf-8')
                self.output+=decodedData
                onData(decodedData)
            except Exception as e:
                if e.errno==11:
                    self.status=self.TerStatus.PENDING
                    return
    def sendOutput(self,output):
        output=f"{output}\n"
        ByteOutput=bytes(output, 'utf-8')
        self.cmdSocket.sendall(ByteOutput)

def onGetData(data):
    print(data,end='')
tester=TerHandler("9904522cafee")
# tester.runTerminalCommand("pip install flask")
while tester.status!=tester.TerStatus.COMPLETED and tester.status!=tester.TerStatus.INITIAL:
    tester.getOutput(1000,onData=onGetData)
    if tester.status==tester.TerStatus.PENDING:
        # inp=random.randint(0,9)
        tester.sendOutput("y")
