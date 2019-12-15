---
layout: post
title: Installing Docker Desktop on Windows 10 Home
additional_header_classes: img-docker-desktop-windows-10-home
image: /img/blog/install-docker-desktop-on-windows-10-home/thumbnail.png
---
In today's world of virtualization you are no longer limited to just having the ability to run other operating systems
by using software that emulates all aspects of the hardware. You can now benefit from the built-in capabilities
of your operating system and hardware and reduce the overhead to fully benefit from your hardware's power and enjoy
having more than one OS without unnecessary complexities. One way to achieve this is to use Docker Desktop
on Windows 10 which no longer requires additional hypervisor software. To do it on the Home edition you still have
to jump through a few more hoops.

# Pre-requisites
Before we can actually start the installation process we have to check if our system and hardware meet all the requirements.
Please see them below.

## OS requirements
Make sure that your system is of at least version `1803`.
You can check that by searching for `Settings` in start menu, then going to `System` and `About` tab.
If you scroll on the main pane you will find section `Windows specification` which should have properties:
`Edition` showing `Windows 10 Home`
`Version` showing at least `1803`

## Hardware requirements
You also have to make sure that your hardware actually does support virtualization features that Docker uses.
To do that find `Command Prompt` in start menu and then run it.
In the prompt run:
```
systeminfo
```

This in the last few lines should display information about `Hyper-V Requirements`.
If everything is ok you should have multiple sections with each one having value `Yes`.
Alternatively you may see the following text:

```
Hyper-V Requirements: A hypervisor has been detected. Features required for Hyper-V will not be displayed.
```

Which means that you have a running hypervisor which means everything is ok.

## Installer
You can get the installer using the suggested process (which requires registration in Docker Hub).
This is described on page: [https://docs.docker.com/docker-for-windows/install/](https://docs.docker.com/docker-for-windows/install/)

If you want to skip the registration you can just download latest stable version from:
[https://download.docker.com/win/stable/Docker%20for%20Windows%20Installer.exe](https://download.docker.com/win/stable/Docker%20for%20Windows%20Installer.exe)

Please note that this installer may take some time to download as the file is quite big.

# Installing Docker Desktop on Windows 10 Home 

Let's get down to the nitty-gritty of the actual installation process.
You have to follow a number of important steps which you can find below.

## Install Hyper-V

Create a bat file with name `hyperv.bat` and contents:
```
pushd "%~dp0"
dir /b %SystemRoot%\servicing\Packages\*Hyper-V*.mum >hyper-v.txt
for /f %%i in ('findstr /i . hyper-v.txt 2^>nul') do dism /online /norestart /add-package:"%SystemRoot%\servicing\Packages\%%i"
del hyper-v.txt
Dism /online /enable-feature /featurename:Microsoft-Hyper-V -All /LimitAccess /ALL
pause
```

In Start Menu search for `Command Prompt`, right click on it and select `Run as administrator`.
Confirm that you want to allow to make changes.
Go to the directory in which you placed the `hyperv.bat` and run it:
```
hyperv.bat
```

This process may take a little while and may require a few restarts (it may ask you if you want to restart later which you can agree to).

## Install Containers

Create a bat file with name `containers.bat` and contents:
```
pushd "%~dp0"
dir /b %SystemRoot%\servicing\Packages\*containers*.mum >containers.txt
for /f %%i in ('findstr /i . containers.txt 2^>nul') do dism /online /norestart /add-package:"%SystemRoot%\servicing\Packages\%%i"
del containers.txt
Dism /online /enable-feature /featurename:Containers -All /LimitAccess /ALL
pause
```

In Start Menu search for `Command Prompt`, right click on it and select `Run as administrator`.
Confirm that you want to allow to make changes.
Go to the directory in which you placed the `hyperv.bat` and run it:
```
containers.bat
```

This process may take a little while and may require a few restarts
(it may ask you if you want to restart later but by now you should probably agree to restart now).

## Modify registry to overcome the limitation of the Docker Desktop installer

In Start Menu search for `Registry Editor` and click on it. When asked about allowing to make changes to the device, agree.
In the tree structure in the left pane go to the path:
```
Computer\HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion
```

When you click on the `CurrentVersion` in the right pane you should see a number of properties.
Find property called `EditionID`. Double click on it and modify its value from `Core` to `Professional`.
This will temporarily make your system look like it is Windows 10 Professional for the Docker Desktop installer.

## Run Docker Desktop installer

Make sure you run the installer soon after the change from the previous step
(also you may have to re-do the previous step during the installation as Windows keeps overriding the value of this key periodically).
It's best to monitor this value every few minutes and make sure that it stays overriden to `Professional`.
As mentioned it will get reverted after by the system automatically.

The installer may start downloading some additional required pieces from the internet so please make sure that you have a working connection.
As it may take same time to run the whole process don't forget to keep the value of the overridden property from previous step set to `Professional`.

# Testing the installation
Once the installation has been completed and the Docker Desktop has successfully started (if not, start it up manually after finding it in Start Menu) you can now test that it was set up successfully.

To do that find `Command Prompt` in start menu and then run it.
In the prompt run:
```
docker run hello-world
```

If everything is ok you should see something like this:
![hello-world-successful](/img/blog/install-docker-desktop-on-windows-10-home/hello-world-successful.png)

# Summary
In this post we have learned how to install Docker Desktop on your Windows 10 Home machine
using a setup that does not require registering on Docker Hub and which overcomes limitations of the installer
which cannot properly recognize Hyper-V enabled systems with Windows 10 Home.
You should now be able to reap all the benefits of the world of Docker without having to upgrade your Windows installation.

Have fun with containers!

### Sources
[https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/reference/hyper-v-requirements](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/reference/hyper-v-requirements)

[https://docs.docker.com/docker-for-windows/](https://docs.docker.com/docker-for-windows/)

[https://docs.docker.com/toolbox/toolbox_install_windows/](https://docs.docker.com/toolbox/toolbox_install_windows/)

[https://docs.docker.com/docker-for-windows/install/](https://docs.docker.com/docker-for-windows/install/)

[StackOverflow discussion about installation without Docker Hub registration](https://stackoverflow.com/questions/58133878/direct-download-of-docker-ce-installation-packages)

[Docker Community forum discussion related to Windows 10 Home installation](https://forums.docker.com/t/installing-docker-on-windows-10-home/11722)