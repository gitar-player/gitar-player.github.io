/*
 Google function setFileDescriptions
 *************************************

 Description:
 Workaround to fake Tags in Google Drive.
 Writes all the folder names (including all parent folders) of a file into the file description, so that the file can be found by searching the folder names.

 Usage:
 1) Install this Google Script:
    - Select "Create Script" in Google Drive
    - Choose "Blank Project" in the menu
    - Empty the content and paste content of this file into the Code.gs
 2) Run script setFileDescriptions (preferrably as scheduled job to have your files up to date)

 Revision:
 Version 3.0: 
    - Compatible to new Google Apps API
    - Writes all ancestor folders in the hierarchy to the description (not only parent)
 Version 2.0: 
    - Also writes all parent folders to the description.
    - Sets description for folders too (folder gets searchable by parent folder)
 Version 1.1: 
    - Removed the nessessity of a file to store information of last run.
*/


function setFileDescriptions() {
  
  var file;
  var filename;
  var folders;
  var filedescription;
  var sortedDescription;
  
  var updateCount = -1;
  while (updateCount != 0)
  { updateCount = setFolderDescriptions(); }
  
  var files = DriveApp.getFiles();
  // sort ascending. Oldest first, in case of timeout:
  //files.sort(function(a,b) {return a.getLastUpdated()-b.getLastUpdated()});
  
  // synchronize folder names of edited file:
  while (files.hasNext()) {
    file = files.next();
    try {
        filename = file.getName();
        //Logger.log("Checking: " +filename +" ("+file.getLastUpdated()+")");
        folders = file.getParents();
        filedescription = "";
        
        while (folders.hasNext()) {
          filedescription = filedescription+folders.next().getDescription()+" ";
        }
        sortedDescription = MyFuncs.squash(filedescription);
      
        if (sortedDescription != file.getDescription())
        { 
          file.setDescription(sortedDescription);
          Logger.log("Updated: " +filename);
        }
     } catch(e){ Logger.log("Error: " +filename+" "+e); }
   }
  
};


function setFolderDescriptions() {

 var folder;
 var parentFolders;
 var parentFolder;
 var folderDescription;
 var sortedDescription;
 var updateCounter = 0; 
  
 var folders = DriveApp.getFolders();
 while (folders.hasNext()) {
   folder = folders.next();
   parentFolders = folder.getParents();
   folderDescription = '';
   while (parentFolders.hasNext()) {
     parentFolder = parentFolders.next();
     if (parentFolder.getDescription() == '')
     { folderDescription += parentFolder.getName() + ' '; }
     else
     { folderDescription += parentFolder.getDescription(); }
   }
   folderDescription += folder.getName();
   sortedDescription = MyFuncs.squash(folderDescription);
   try {
     if (folder.getDescription() != sortedDescription)
     {
       folder.setDescription(sortedDescription)
       Logger.log(folder.getName() +': '+ sortedDescription);
       updateCounter++;
     }
   } catch(e){ Logger.log("Error: " +folder.getName()+" "+e); }
 }
 Logger.log('folder updates: '+updateCounter);
 return updateCounter;
}

function clearFolderDescriptions() {
 var folders = DriveApp.getFolders();
 while (folders.hasNext()) {
  folders.next().setDescription('');
 }
}

var MyFuncs = {
  squash: function (str) {
  var strOut = '';
    
  // sorted array:
  strArr = str.split(" ").sort();

  for (var i = 0; i < strArr.length; i++)
  {
    if (strArr[i] != strArr[i-1])
    { strOut += strArr[i] + " "; }
  }
    
  return strOut;
}
}