import subprocess
import logging

logger = logging.getLogger(__name__)

class ShellExecutionSkill:
    def __init__(self, agent):
        self.agent = agent

    def execute(self, task):
        self.agent.log(f"ShellExecutionSkill received task: {task}")
        command = task.get('command')
        if not command and 'requirements' in task:
             command = task.get('requirements', {}).get('command')
        
        cwd = task.get('cwd', '.')
        
        if not command:
            return {"status": "error", "message": f"No command provided in task keys: {list(task.keys())}"}

        self.agent.log(f"Executing shell command: {command}")
        
        try:
            # Run command and capture output
            result = subprocess.run(
                command, 
                shell=True, 
                cwd=cwd, 
                capture_output=True, 
                text=True,
                encoding='utf-8'
            )
            
            if result.returncode == 0:
                return {
                    "status": "success",
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "code": result.returncode
                }
            else:
                return {
                    "status": "error",
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "code": result.returncode,
                    "message": f"Command failed with exit code {result.returncode}"
                }
                
        except Exception as e:
            logger.error(f"Shell execution failed: {str(e)}")
            return {"status": "error", "message": str(e)}
