import select
import subprocess
import docker
from enum import Enum
import shlex
class containerManager:
    def createContainer():
        result=subprocess.run(
            shlex.split("docker create -a stdin -a stdout -i -t ubuntu"), capture_output=True
        )
        if result.stderr:
            return None
        return result.stdout.decode("utf-8")
    def runContainer(self,givenId):
        containerId=""
        if not givenId:
            containerId=self.createContainer()
            if not containerId:
                return None    
        else:
            containerId=givenId
        result=subprocess.run(
            shlex.split(f"docker start {containerId}"), capture_output=True
        )
        if result.stderr:
            subprocess.run(
            shlex.split(f"docker rm {containerId}"), capture_output=True
            )   
            return None
        return result.stdout.decode("utf-8")
    def removeContainer(givenId):
        res=subprocess.run(shlex.split(f"docker rm {givenId}"), capture_output=True)   
        if res.stderr:
            return None
        return res.stdout.decode("utf-8")    
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
        cl=docker.from_env()
        con=cl.containers.get(self.conId)
        if con.status!="running":
            result=subprocess.run(shlex.split(f"docker start {self.conId}"), capture_output=True)
            if result.stderr:                   
                print("failed to start container")
                return False
        self.container=con
        return True
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
tester.runTerminalCommand("apt-get install vim")
# while tester.status!=tester.TerStatus.COMPLETED and tester.status!=tester.TerStatus.INITIAL:
#     tester.getOutput(1000,onData=onGetData)
#     if tester.status==tester.TerStatus.PENDING:
#         inp=random.randint(0,9)
#         tester.sendOutput("y")
