const saveNewNoteButton = document.getElementById('save-note-button');
const newNoteInput = document.getElementById('new-note-input');
const preview = document.getElementById('preview');
const previewParent = document.getElementById('preview-parent');

window.addEventListener('markdown-reply', (event) => {
    preview.innerHTML = event.detail;
});

window.addEventListener('fileFoundNotes-reply', event => {
    newNoteInput.value = event.detail.data;  
    window.electronAPI.markD(newNoteInput.value);
});

newNoteInput.addEventListener('input', () => {
    window.electronAPI.markD(newNoteInput.value);
});

newNoteInput.addEventListener('scroll', () => {
    previewParent.scrollTop = newNoteInput.scrollTop;
});

saveNewNoteButton.addEventListener('click', () => {
    window.electronAPI.saveNewNote(newNoteInput.value);
});

