import subprocess
import shlex
class containerManager:
    def createContainer(self):
        result=subprocess.run(
            shlex.split("docker create -a stdin -a stdout -i -t ubuntu"), capture_output=True
        )
        if result.stderr:
            return None
        return result.stdout.decode("utf-8")
    def runContainer(self,givenId):
        import docker
        cl=docker.from_env()
        con=cl.containers.get(givenId)
        if con.status!="running":
            result=subprocess.run(shlex.split(f"docker start {givenId}"), capture_output=True)
            if result.stderr:                   
                print("failed to start container")
                return None
        return con
    def removeContainer(self,givenId):
        res=subprocess.run(shlex.split(f"docker rm -f {givenId}"), capture_output=True)   
        if res.stderr:
            return None
        return res.stdout.decode("utf-8")  
    def containerExist(self,givenId): 
        import docker
        cl=docker.from_env()
        try:
            con=cl.containers.get(givenId)
            print(con)
            return True       
        except Exception:
            return False
