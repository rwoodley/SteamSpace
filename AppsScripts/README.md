Roles:
- Teacher   
- Student   
- SteamSpace Admin 

Workflow:   
- The Admin shares the installer script with the teacher.   
- The Teacher runs the script as him/herself. The script has 2 parts. At the end of part 1 the teacher has to publish the MainScript and give the key as well as his/her name to part 2 of the script. Part 2 will create the key file.(*)   
- The Teacher runs 'Test()' to set up all the permissions.   
- The Teacher puts a link to the key file out on his/her web page.
- The Student clicks on the link and opens the key file (which is an empty spreadsheet). That is sufficient to share the file to the Student. The Student then closes the file.   

(*) This manual step is obviously undesirable. I have flagged [the relevant issue](https://code.google.com/p/google-apps-script-issues/issues/detail?id=1703) with Google. When/if it gets fixed, this manual step will no longer be required. [Here](http://www.steamspace.net/PublishingInstructions.html) are instructions on how to publish the MainScript.

----------------
Click here to install steam space if you are a teacher: [https://script.google.com/a/macros/steamspace.net/s/AKfycbxZ35vXFnC4XiohvHUrH-WOoY_xRd1uC6_RKCFc_lARmx-fWCA/exec]   

----------------
The 3 main scripts:   

The AssignmentScript has the core logic. It is not published. It is shared because it is a 'library' that will be used by MainScript. More info on app script libraries [here](https://developers.google.com/apps-script/guide_libraries).

The MainScript is shared to Teachers by the Installer script. The teacher gets a copy which they will then publish to students. It refers to the specific version of AssignmentScript. Right now there is no way for teachers to get an updated MainScript (and hence no way to get an updated AssignmentScript) without deleting the existing MainScript and running the installer. This is OK, because it allows us to control roll-outs. Of course eventually we need an updater script to decide when/to whom the new MainScript should be deployed.   

What is the advantage of breaking out the AssignmentScript and the MainScript into 2 files? This ensures that the AssignmentScript which has most of the core logic is read-only and can't be broken. The copy of the MainScript that the teacher has can be edited by him of course but there is not much there of interest to 'improve' or tinker with.   Note that the AssignmentScript can still be read by someone who takes the time to find it, so the logic is not concealed, it is rather simply immune to modifications.   

The installer script is shared in a way that it runs by whomever invokes it (using the link above).   

