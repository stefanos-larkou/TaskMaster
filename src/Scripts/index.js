const newNoteButton = document.getElementById('new-note-button');
newNoteButton.addEventListener('click', () => {
    window.electronAPI.newNote();
});

const editNoteButton = document.getElementById('view-notes-button');
editNoteButton.addEventListener('click', () => {
    window.electronAPI.edit('Notes');
});

const newTaskButton = document.getElementById('new-task-button');
newTaskButton.addEventListener('click', () => {
    window.electronAPI.newTask();
});

const editTaskButton = document.getElementById('view-task-button');
editTaskButton.addEventListener('click', () => {
    window.electronAPI.edit('Tasks');
});

const quitButton = document.getElementById('quit-app');
quitButton.addEventListener('click', () => {
    window.electronAPI.quitApp();
});