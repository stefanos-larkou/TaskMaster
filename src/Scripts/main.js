const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const prompt = require('electron-prompt');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked')
const { markedTwemoji } = require('marked-twemoji');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 820,
    minWidth: 820,
    minHeight: 800,
    icon: path.resolve(__dirname, '../icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });
  mainWindow.setMenu(null);
  mainWindow.loadFile(path.resolve(__dirname, '../Views/index.html'));
};

app.whenReady().then(() => {
  ipcMain.on('clickIndex', index);
  ipcMain.on('clickNewNote', newNote);
  ipcMain.on('clickNewTask', newTask);
  ipcMain.on('clickEdit', (event, type) => edit(event, type));
  ipcMain.on('loadEdit', (event, type) => loadEdit(event, type))
  ipcMain.on('clickQuit', quitApp);
  ipcMain.on('clickSaveNewNote', (event, note) => saveNewNote(note));
  ipcMain.on('markdown', (event, text) => markD(event, text));
  ipcMain.on('clickSaveTask', (event, listName, taskList) => saveTask(listName, taskList));
  ipcMain.on('loadFile', (event, name, type) => loadFile(event, name, type));
  ipcMain.on('deleteFile', (event, file, type) => deleteFile(file, type)); 
  
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function index(){
  mainWindow.loadFile(path.resolve(__dirname, '../Views/index.html'));
}

function newNote(){
  mainWindow.loadFile(path.resolve(__dirname, '../Views/note.html'));
}

function edit(event, type){
  mainWindow.loadFile(path.resolve(__dirname, '../Views/edit' + type.toLowerCase().slice(0, -1) + '.html'))
  .then(() => event.sender.send('clickEdit-reply', type));
}

function loadEdit(event, type){
  const pathToFile = path.resolve(__dirname, '../' + type);
  let  extension = type === 'Notes' ? '.md' : '.task';
  const files = [];
  const fileswoExtension = [];

  fs.readdir(pathToFile, (error, fileNames) => {
    fileNames.forEach(fileName => {
      if (!fileName.endsWith(extension)) {
        fs.unlink(path.resolve(__dirname, `../${type}/${fileName}`), (err) => {
          if (err) {
            console.error(err)
            return
          }
          console.log(`Deleted ${fileName}. Do not place external items in here :)`)
        });
      }
      else {
        files.push(fileName);
      }
    });

    if(files.length === 0) {
      let newDialog = messageChild('info', 
                    'Oops!', 
                    'You have no saved notes!');
      newDialog.then(() => {mainWindow.loadFile(path.resolve(__dirname, '../Views/index.html'))});
    }
    else{
      files.forEach(file => {
        fileswoExtension.push(file.split('.')[0])
      });
      event.sender.send('loadEdits-reply', fileswoExtension, type);
    }
  });
}

function newTask(){
  mainWindow.loadFile(path.resolve(__dirname, '../Views/task.html'));
}

function quitApp(){
  app.quit();
}

function loadFile(event, name, type) {
  extension = type === 'Notes' ? '.md' : '.task';
  name = name + extension;
  const pathToFile = path.resolve(__dirname, '../' + type + '/' + name);

  if(!fs.existsSync(pathToFile)){
    let newDialog = messageChild('error', 
                      'Uh-oh!', 
                      'File could not be found!')
      .then(() => mainWindow.loadFile(path.resolve(__dirname, '../Views/edit' + type.toLowerCase().slice(0, -1) + '.html')));
  }
  else {
    fs.readFile(pathToFile, 'utf-8', (error, data) => {
      mainWindow.loadFile(path.resolve(__dirname, '../Views/' + type.toLowerCase().slice(0, -1) + '.html'))
      .then(() => event.sender.send('fileFound-reply', data, name, type));
    });
  }
}

function messageChild(type, title, message, buttons=['OK'], modal=true) {
  return new dialog.showMessageBox(mainWindow, {
								type: type,
								title: title,
								message: message,
								modal: modal,
								buttons: buttons
						  });

}

function testSpecialCharacters(str) {
  const specialChars = /[`!@#$%^*+\-=\[\]{};':"\\|,.<>\/?~]/;
  return specialChars.test(str);
}

async function saveNewNote(note){
  // Error popup if user tries to save empty note
  if(note.length === 0 || note === null || note === undefined){
    console.log('\nEmpty note\n');
    await messageChild('error', 
                    'Uh-oh!', 
                    'You cannot save an empty note!'
                  );
    return;
  }

  // Prompt popup asking the user to name the new file
  mainWindow.setEnabled(false);
  r = await prompt({
  title: 'Save Note',
  label: 'Filename',
  type: 'input',
  height: 180,
  skipTaskbar: false});
	
	// If user presses x nothing happens
	if(r === null || r === undefined){
    console.log('\nX pressed\n');
    return;
  }
  // Error popup if user tries to leave filename empty
  else if(r.trim().length === 0) {
    console.log('\nEmpty name\n');
    await messageChild('error', 
                    'Uh-oh!', 
                    'Filename cannot be empty!');
    await saveNewNote(note);
  }
  // Error popup if user tries to add (most) special charavters to filename
  else if(testSpecialCharacters(r)) {
    console.log('\nSpecial characters\n');
    await messageChild('error',
                    'Uh-oh!',
                    'Filename cannot include special characters!');
    await saveNewNote(note);
  }
  else if(fs.existsSync(path.resolve(__dirname, '../Notes/' + r + '.md'))) {
    console.log('\nFile exists\n');
		const index = await messageChild('warning',
                      'File already exists!',
                      'Do you want to overwrite the file?',
											buttons=['Yes', 'No']);
    await console.log('\nmade decision\n');

		if (index.response === 0) {
      console.log('\nOverwritten\n');
      const fileName = r.trim() + '.md';
      fs.writeFile(path.resolve(__dirname, '../Notes/' + fileName), note, 'utf8', () => {});

      await messageChild('info',
                  'File saved!',
                  'Your file has been saved successfully');
      await console.log('\noverwrite done\n');
		}
		else {
      console.log('\nNot overwritten\n');
			await saveNewNote(note);
		}
  }
  else {
    console.log('\nSaved\n');
    const fileName = r.trim() + '.md';
    fs.writeFile(path.resolve(__dirname, '../Notes/' + fileName), note, 'utf8', () => {});

    await messageChild('info',
                'File saved!',
                'Your file has been saved successfully');
  }
  await mainWindow.setEnabled(true);
}


function markD(event, text){
  marked.use({extensions: [markedTwemoji]});
  const result = marked(text);
  event.sender.send('markdown-reply', result);
}

function saveTask(listName, taskList){
  fileName = listName + '.task';

  if(fs.existsSync(path.resolve(__dirname, '../Tasks/' + fileName))) {
    let newDialog = messageChild('warning',
                      'File already exists!',
                      'Do you want to overwrite the file?',
											buttons=['Yes', 'No']);
    newDialog.then(index => {
      if (index.response === 0) {
        fs.writeFile(path.resolve(__dirname, '../Tasks/' + fileName), taskList, 'utf8', () => {});

        let newDialog = messageChild('info',
                    'File saved!',
                    'Your file has been saved successfully');

      }
    });
  }
  else {
    fs.writeFile(path.resolve(__dirname, '../Tasks/' + fileName), taskList, 'utf8', () => {});
    let newDialog = messageChild('info',
                    'File saved!',
                    'Your file has been saved successfully');

  }
}

async function deleteFile(file, type) {
  const fileName = type === "Notes" ? file + '.md' : file + '.task';

  if(!fs.existsSync(path.resolve(__dirname, `../${type}/${fileName}`))){
    await messageChild('error',
                    'Uh-oh!',
                    'File could not be found!');

    await mainWindow.loadFile(path.resolve(__dirname, '../Views/edit' + type.toLowerCase().slice(0, -1) + '.html'));
  }
  else {
    const index = await messageChild('warning',
                                  'File delete!',
                                  `Are you sure you want to delete "${fileName}"?`,
                                  buttons=['Yes', 'No']);
    
    if (index.response === 0) {
      console.log(`../${type}/${fileName}`);
      fs.unlink(path.resolve(__dirname, `../${type}/${fileName}`), () => {
        mainWindow.loadFile(path.resolve(__dirname, '../Views/edit' + type.toLowerCase().slice(0, -1) + '.html'));
      });
    }
  }
}