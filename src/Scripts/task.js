const addTaskButton = document.getElementById("add-task-button");
const saveListButton = document.getElementById('save-task-button');
const checklistContainer = document.getElementById("checklist-container");
const listName = document.getElementById('list-name');

const specialChars = /[`!@#$%^*+\-=\[\]{};':"\\|,.<>\/?~]/;

function checkListNameValidity(){
    if(specialChars.test(listName.value) ) {
        listName.setCustomValidity('The list name cannot contain (most) special characters!');
        return false;
    }
    else if(listName.value.trim().length === 0) {
        listName.setCustomValidity('Fill in task list name before proceeding.');
        return false;
    }
    listName.setCustomValidity('');
    return true
}

function checkTaskValidity(task) {
    if(task.value.trim().length === 0) {
        task.setCustomValidity('The task field cannot be empty!');
        return false;
    }
    task.setCustomValidity('');
    return true;
}

window.addEventListener('fileFoundTasks-reply', event => {
    checklistContainer.innerHTML = event.detail.data;
    listName.value = event.detail.name.split('.')[0];

    const checkboxes = Array.from(document.getElementsByClassName('checklist-checkbox'));

    checkboxes.forEach((checkbox) => {
        if(checkbox.classList.contains('checked')){
            checkbox.checked = true;
        }
        else {
            checkbox.checked = false;
        }
        
        checkbox.addEventListener('change', () => {
            checkbox.classList.toggle('checked');
        });
    });
});

listName.addEventListener('input', () => {
    listName.setCustomValidity('');
});

document.addEventListener("click", event => {
    if(event.target.className === "done-button") {
        let previousElement = event.target.previousElementSibling;
        if(previousElement.tagName === 'INPUT'){
            if(!checkTaskValidity(previousElement)){
                previousElement.reportValidity();
                return;
            }

            const label = document.createElement('label');
            label.innerHTML = previousElement.value;
            label.classList.add('checklist-task-done');
            event.target.innerHTML = 'Edit';
            previousElement.parentNode.replaceChild(label, previousElement);
        }
        else if(previousElement.tagName === 'LABEL'){
            const input = document.createElement('input');
            input.type = 'text';
            input.value = previousElement.innerHTML;
            input.required = true;
            input.classList.add('checklist-task');
            input.setCustomValidity(' ');
            input.addEventListener('input', () => {
                input.setCustomValidity('');
            });
            event.target.innerHTML = 'Done';
            previousElement.parentNode.replaceChild(input, previousElement);
        }
    }

    if(event.target.className === 'remove-button'){
        event.target.parentElement.remove();
    }
});

addTaskButton.addEventListener("click", () => {
    const checklistTasks = Array.from(document.querySelectorAll(".checklist-task"));

    let valid = checkListNameValidity();
    if(!valid) {
        return;
    }

    checklistTasks.forEach((task) => {
        valid = checkTaskValidity(task);

        if(!valid){
            return;
        }
    });

    if(!valid) {
        return;
    }

    const newChecklistItem = document.createElement("div");
    newChecklistItem.classList.add("checklist-item");

    const newCheckbox = document.createElement("input");
    newCheckbox.type = "checkbox";
    newCheckbox.classList.add("checklist-checkbox");
    newCheckbox.addEventListener('keydown', event => {
        event.preventDefault();
    });
    newCheckbox.addEventListener('change', () => {
        newCheckbox.classList.toggle('checked');
    })

    const newTaskInput = document.createElement("input");
    newTaskInput.type = "text";
    newTaskInput.classList.add("checklist-task");
    newTaskInput.required = true;
    newTaskInput.setCustomValidity(' ');
    newTaskInput.addEventListener('input', () => {
        newTaskInput.setCustomValidity('');
    });

    const newDoneButton = document.createElement('button');
    newDoneButton.type = 'button';
    newDoneButton.classList.add('done-button');
    newDoneButton.innerHTML = 'Done'

    const newRemoveButton = document.createElement('button');
    newRemoveButton.type = 'button';
    newRemoveButton.classList.add('remove-button');
    newRemoveButton.innerHTML = 'Remove'

    newChecklistItem.appendChild(newCheckbox);
    newChecklistItem.appendChild(newTaskInput);
    newChecklistItem.appendChild(newDoneButton);
    newChecklistItem.appendChild(newRemoveButton);

    checklistContainer.appendChild(newChecklistItem);
});

saveListButton.addEventListener('click', () => {
    const checklistTasks = Array.from(document.querySelectorAll(".checklist-task"));

    if(!checkListNameValidity()){
        return;
    }

    const inputElements = document.querySelectorAll('input[type="text"]');
    let remainingInput = false;

    inputElements.forEach(input => {
        if(input.id !== 'list-name'){
            input.setCustomValidity('You must confirm all tasks before saving!')
            input.reportValidity();
            remainingInput = true;
            return;
        }
    });

    if(remainingInput){
        return;
    }
    
    window.electronAPI.saveTask(listName.value, checklistContainer.innerHTML);
});