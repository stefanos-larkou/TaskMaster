const fileContainer = document.getElementById('file-container');

document.addEventListener('DOMContentLoaded', () => {
    fileContainer.innerHTML = '';
    window.electronAPI.loadEdit('Notes');
})

window.addEventListener('loadEditsNotes-reply', (event) => {
    const newFiles = event.detail;
    newFiles.sort();

    newFiles.forEach((file) => {
        const fileButtons = document.createElement('div');
        fileButtons.classList.add('file-buttons');

        const newButton = document.createElement('button');
        newButton.innerHTML = file;
        newButton.classList.add('file-button');

        newButton.addEventListener('click', () => {
            window.electronAPI.loadFile(newButton.innerHTML, 'Notes');
        });

        const newDeleteButton = document.createElement('button');
        newDeleteButton.classList.add('file-delete-button');
        newDeleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'

        newDeleteButton.addEventListener('click', () => {
            window.electronAPI.deleteFile(file, 'Notes');
        })

        fileButtons.appendChild(newButton);
        fileButtons.appendChild(newDeleteButton);

        fileContainer.appendChild(fileButtons);
    });
});