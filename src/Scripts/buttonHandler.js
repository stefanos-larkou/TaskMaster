document.addEventListener('DOMContentLoaded', () => {
    const buttons = Array.from(document.getElementsByTagName('button'));
    buttons.forEach((b) => {
        b.addEventListener('keydown', event => {
            event.preventDefault();
        });
    });
});

try {
    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', () => {
        window.electronAPI.index()
    });
}
catch{}