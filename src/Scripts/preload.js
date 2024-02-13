const { contextBridge, ipcRenderer, dialog } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    index: () => ipcRenderer.send('clickIndex'),
    newNote: () => ipcRenderer.send('clickNewNote'),
    newTask: () => ipcRenderer.send('clickNewTask'),
    edit: type => ipcRenderer.send('clickEdit', type),
    loadEdit: type => ipcRenderer.send('loadEdit', type),
    quitApp: () => ipcRenderer.send('clickQuit'),
    saveNewNote: note => ipcRenderer.send('clickSaveNewNote', note),
    markD: text => ipcRenderer.send('markdown', text),
    saveTask: (listName, taskList) => ipcRenderer.send('clickSaveTask', listName, taskList),
    loadFile: (name, type) => ipcRenderer.send('loadFile', name, type),
    deleteFile: (file, type) => ipcRenderer.send('deleteFile', file, type)
});

ipcRenderer.on('markdown-reply', (event, result) => {
    window.dispatchEvent(new CustomEvent('markdown-reply', { detail: result }));
});

ipcRenderer.on('clickEdit-reply', (event, type) => {
    window.dispatchEvent(new CustomEvent('edit' + type + '-reply'));
});

ipcRenderer.on('loadEdits-reply', (event, files, type) => {
    window.dispatchEvent(new CustomEvent('loadEdits' + type + '-reply', { detail: files }));
});

ipcRenderer.on('fileFound-reply', (event, data, name, type) => {
    window.dispatchEvent(new CustomEvent('fileFound' + type + '-reply', { detail: {data: data, name: name} }));
});