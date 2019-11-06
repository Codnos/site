---
layout: post
title: Installing WSL on Windows 10 without using Store
---
For many developers the ideal environment to operate in is *nix system.
It's got all the necessary tooling, it allows automating everything easily using
code/scripts most often than not portable across platforms and in many cases
the actual server runtime for their applications is a *nix system, so using
the same platform to run the application locally as on the server makes perfect sense.

The reality is that in many organisations the desktop OS is Windows.
So what can be done to have the best of both worlds?

On personal computers you can usually resort to using dual-boot.
In corporate environment that is not achievable though.

Another solution is using a virtual machines, e.g. using Virtual Box.
This can be a bit slow, consumes a lot of resources and involves switching
back and forth between the guest OS and host OS. Not very practical
and in most big organisations also not doable as software for virtual machines
cannot be installed.

Seeing the problem Microsoft has decided to make it possible to use
all the goodness of *nix systems from withing Microsoft Windows
and created Windows Subsystem for Linux (WSL) which is built into your OS.
It has to be enabled though first and requires you to install
your Linux distribution of choice (or many of them) on your machine
in additional to the WSL layer.

# Installing WSL using Microsoft Store
The sunny day scenario is that you have full control of your machine (admin rights and no organisational policies in place)
and it has all the necessary dependencies installed and available to you.
In this case the you can just follow [Official instructions from MS](https://docs.microsoft.com/en-us/windows/wsl/install-win10).
Bear in mind that this requires having an account that you can use with Microsoft Store.
If your situation matches the criteria - you're sorted, just use the link above.
Otherwise - read on.

# Installing WSL without Microsoft Store 
When the only thing that you have is **temporarily provided Privileged Access**
then you have to resort to using the set of steps that are a bit more complex
but which will provide you with the same end result.

The [official installation instructions for manual install](https://docs.microsoft.com/en-us/windows/wsl/install-manual) are quite terse
and don't necessarily cater for the complex setup that you are faced with in corporate environment.

All the steps below assume that you have **Administrator access** to PowerShell.
Please start the session and use the following steps:

- Make sure your system has got *Windows Subsystem for Linux* activated
```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
```

- Go to list [official manual WLS installation page](https://docs.microsoft.com/en-us/windows/wsl/install-manual)
and pick the distribution that you want to use. Copy the link location of that distribution.
In my example it is going to be `https://aka.ms/wsl-kali-linux-new`

- For users that are in tightly secured corporate environment you may have to
download the file manually through your means of accessing external websites
or if you have Windows configured with **NTLM Authorized Proxy** configuration
you can configure the PowerShell to use the Proxy setting from IE.
```powershell
$Wcl = new-object System.Net.WebClient
$Wcl.Headers.Add(“user-agent”, “PowerShell Script”)
$Wcl.Proxy.Credentials = [System.Net.CredentialCache]::DefaultNetworkCredentials
```

- Download the distribution file to local disk (may take a while)
```powershell
Invoke-WebRequest -Uri https://aka.ms/wsl-kali-linux-new -OutFile ~/Kali.zip -UseBasicParsing
```

- Extract the distribution
```powershell
Expand-Archive ~/Kali.zip D:/dev/kali
```

- If you are using Kali (as opposed some other distributions) you may have to do another extraction
```powershell
cd D:/dev/kali
Copy-Item DistroLauncher-Appx_1.1.9.0_x64.appx DistroLauncher-Appx_1.1.9.0_x64.zip
Expand-Archive .\DistroLauncher-Appx_1.1.9.0_x64.zip .\kali-x64
```

- Go to the directory and start installation
```powershell
cd kali-x64
.\kali.exe
```

You should see the result as per below screenshot
![installation-successful](/img/blog/install-wsl-on-windows-10-without-store/installation-successful.png)

# Further setup
Steps in this section should be run from your **WSL distribution**.

In the corporate environment you quite frequently sit behind a proxy. Quite often NTLM authenticated proxy.
Depending if you need that authorization or not it may be sufficient to just configure the proxy in standard way.

### Standard proxy
``` sh
echo export http_proxy="http://PROXY_SERVER:PORT" >> ~/.bashrc
echo export https_proxy="https://PROXY_SERVER:PORT" >> ~/.bashrc
```

You should run this for both your user as well as root

``` sh
sudo su -
echo export http_proxy="http://PROXY_SERVER:PORT" >> ~/.bashrc
echo export https_proxy="https://PROXY_SERVER:PORT" >> ~/.bashrc
```

### NTLM Authenticated Proxy
If standard proxy is not sufficient and you need NTLM authentication then:
- Download [http://archive.ubuntu.com/ubuntu/pool/universe/c/cntlm/cntlm_0.92.3-1ubuntu1_amd64.deb](http://archive.ubuntu.com/ubuntu/pool/universe/c/cntlm/cntlm_0.92.3-1ubuntu1_amd64.deb)
in your Windows browser and put it into your user home directory.

- From your WSL shell run:
```sh
sudo dpkg -i /mnt/c/Users/<windows user>/cntlm_0.92.3-1ubuntu1_amd64.deb
```

- Edit /etc/cntlm.conf
```sh
sudo vim /etc/cntlm.conf
```
Make sure to put in your config correct details of your proxy and Windows user + domain:
```
# /etc/cntlm.con
Domain      DOMAIN
Username    USERNAME
Proxy       PROXY_SERVER:PORT
NoProxy     localhost, 127.0.0.*, 10.*, 192.168.*, *.your.corp.domain
Listen      3128
```

- Generate hashes of your password
```sh
sudo cntlm -H
```

- Put the generated hashes into /etc/cntlm.conf
```
PassLM          <generated hash from command above>
PassNT          <generated hash from command above>
PassNTLMv2      <generated hash from command above>    # Only for user 'USERNAME', domain 'DOMAIN'
```

- (Re)start your CNTLM proxy
```sh
service cntlm restart
```

- Setup proxy settings to point to CNTLM for your user
``` sh
echo export http_proxy="http://localhost:3128" >> ~/.bashrc
echo export https_proxy="https://localhost:3128" >> ~/.bashrc
```

- Setup proxy settings to point to CNTLM for root account

``` sh
sudo su -
echo export http_proxy="http://localhost:3128" >> ~/.bashrc
echo export https_proxy="https://localhost:3128" >> ~/.bashrc
```

# Testing run
After all the steps above you should now be ready to do anything you want with your new Linux distro.
A final step to confirm that all the above configuration has been setup correctly is to get your package manager up to date:
```sh
sudo su -
apt-get update
```

If everything is ok you should see something like this:
![update-successful](/img/blog/install-wsl-on-windows-10-without-store/update-successful.png)

# Summary
In this post we have learned how to install WSL on your Windows machine
using a manual setup which can overcome some of the limitations of corporate world.
Hopefully by now you have a working bash console which will allow you to enjoy your work in Windows world much more.

Happy hacking!

### Sources
[https://docs.microsoft.com/en-us/windows/wsl/install-on-server](https://docs.microsoft.com/en-us/windows/wsl/install-on-server)

[https://docs.microsoft.com/en-us/windows/wsl/install-manual](https://docs.microsoft.com/en-us/windows/wsl/install-manual)

[https://docs.microsoft.com/en-us/windows/wsl/initialize-distro](https://docs.microsoft.com/en-us/windows/wsl/initialize-distro)

[http://woshub.com/using-powershell-behind-a-proxy/](http://woshub.com/using-powershell-behind-a-proxy/)

[https://askubuntu.com/questions/1121521/how-to-configure-http-proxy-with-authentication-on-ubuntu-wsl-on-windows-10/1133682](https://askubuntu.com/questions/1121521/how-to-configure-http-proxy-with-authentication-on-ubuntu-wsl-on-windows-10/1133682)