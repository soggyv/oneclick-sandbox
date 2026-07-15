import paramiko

IP = "188.245.35.229"
USER = "root"
PASSWORD = "OneClick@2026!Password"

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(IP, username=USER, password=PASSWORD, timeout=15)
    
    commands = [
        "ls -la /var/www/oneclick",
        "docker ps"
    ]
    
    for cmd in commands:
        print(f"\n--- Running: {cmd} ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        if out:
            print(out)
        if err:
            print("STDERR:", err)
            
    client.close()

if __name__ == "__main__":
    main()
