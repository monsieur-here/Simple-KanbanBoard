const addButton = document.querySelector(".add-btn")
const removeButton = document.querySelector(".remove-btn")
const modalContainer = document.querySelector(".modal-container")
const ticketContainer = document.querySelector(".ticket-container")
const ticketLocker = document.querySelector(".ticket-lock > i")

const allContainers = document.querySelectorAll(".modal-color")
const textAreaContainer = document.querySelector(".textArea-container")
const mainContainer = document.querySelector(".main-container")
const allFilterContainers = document.querySelectorAll(".color")

// To perform an HTML event we use addEventListener function hence in this case we need to open the task by addition

let isTaskOpen = false
let isDeleteModeActive = false
let currentColor = "lightpink"
let taskLock = false

const lockedClass = "fa-lock"
const unlockedClass = "fa-lock-open"

const ticketsArray = []
const colorsArray = ['lightpink', 'lightgreen', 'lightblue', 'black']

const LOCALSTORAGE_KEY = 'tickets'

// Retrieve the value of tickets from LocalStorage

//Step 1: Get the tickets from local storage (type String)
const ticketsInStorage = localStorage.getItem(LOCALSTORAGE_KEY)

if(ticketsInStorage){
    const getTickets = JSON.parse(ticketsInStorage)
    // Since forEach works only for arrays not for strings or objects we can use just that
    getTickets.forEach((ticket) => {
        createTask(ticket.type, ticket.value, ticket.id)
    })
}

function revisedRandId() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substring(2, 10)
}

addButton.addEventListener('click', event => {
    if(!isTaskOpen){
        //Open it
        modalContainer.style.display = "flex"
        // ticketContainer.style.opacity = '0.4'
        isTaskOpen = true
    }
    else{
        // Close it
        modalContainer.style.display = "none"
        isTaskOpen = false
    }
})

removeButton.addEventListener('click', event => {
    isDeleteModeActive = !isDeleteModeActive
    if(isDeleteModeActive){
        alert("Activated delete button")
        removeButton.style.color = "red"
    }
    else{
        alert("Deactivated delete button")
        removeButton.style.color = "white"
    }
})

// Add event listeners to the priority container so that the box we clicked on gets selected and the rest is removed

allContainers.forEach((container) => {
    container.addEventListener('click', ()=> {
        allContainers.forEach((container) => {
            container.classList.remove('active')
        })
        container.classList.add('active')
        currentColor = container.classList[0]
        // const textAreaValue = textAreaContainer.value
        
        // const id = 1354
    })
})

modalContainer.addEventListener('keydown', event => {
    if(event.key == 'Shift'){
        //1. Get the value of current Priority which is already in the container
        //2. Get the value of textArea and also add the id
        const textAreaValue = textAreaContainer.value

        const shortid = revisedRandId()

        createTask(currentColor, textAreaValue, shortid)

        // Reset the textArea value
        textAreaContainer.value = ""

        //Close the modal
        modalContainer.style.display = "none"

        // Reset the vairable which was tracking open or close status
        isTaskOpen = false

        // Reset currentColor
        currentColor = "lightpink"
    }
})

// Filtering colors
allFilterContainers.forEach((container) => {

    container.addEventListener('click', event => {
        // fetching the color
        const filterColor = container.classList[0]
        
        // Filter my list of tasks to get only those that match

        const filteredTasks = ticketsArray.filter((elem) => {
            return filterColor == elem.type
        })
        // Re-generate my DOM using these filtered tasks/tickets

        // Step 1: Get all tickets & remove them from the DOM
        const allTicketDivs = document.querySelectorAll('.ticket-container')

        allTicketDivs.forEach((ticket) => {
            ticket.remove()
        })

        // Re-create new filtered items to the DOM
        filteredTasks.forEach((filteredTask) => {
            createTask(filteredTask.type, filteredTask.value, filteredTask.id)
        })
    })
        // console.log(filterTask, ticketsArray)

    container.addEventListener('dblclick', event => {
        const allTicketDivs = document.querySelectorAll('.ticket-container')

        allTicketDivs.forEach((ticket) => {
            ticket.remove()
        })

        // Re-create new filtered items to the DOM
        ticketsArray.forEach((filteredTask) => {
            createTask(filteredTask.type, filteredTask.value, filteredTask.id)
        })
    })
        
})

// Reusable function to create tasks and filter out when there are multiple tasks
function createTask(taskType, taskValue, taskId){
    
    //1. Create a new element
    const newDiv = document.createElement("div")
    newDiv.classList.add("ticket-container")

    //2. Modify the children of newly created div using innerHTML
    //Generating the tasks dynamically using template literal ${}
    newDiv.innerHTML = `<div class="ticket-color ${taskType}"></div>
                        <div class="ticket-id">${taskId}</div>
                        <div class="task-area">${taskValue}</div>
                        <div class="ticket-lock">
                            <i class="fa-solid fa-lock"></i>
                        </div>`

    //To prevent the task from repeating multiple times after clicking on the webpage and console --
    const ticketIndex = ticketsArray.findIndex((elem) => {
        return elem.id == taskId
    })
    
    if(ticketIndex == -1){
    // Creating a ticket object to perform task filtering
        const ticketObject  = {
            'id': taskId,
            'type': taskType,
            'value': taskValue
        }
        ticketsArray.push(ticketObject)

        // Update the application state
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(ticketsArray))
    }
    // console.log(ticketsArray)
    
    handleRemoval(newDiv, taskId)
    handleLock(newDiv, taskId)
    handlePriorityChange(newDiv, taskId)
    
    //3. Append the children to main container
    mainContainer.appendChild(newDiv)
}

function handleRemoval(div,id){
    const idx = findTicketIdx(id)
    div.addEventListener('click', event => {
        if(isDeleteModeActive){
            // Two ways of removing or hiding an item
            //1. Setting display to none
            //2. Calling the remove function
            div.remove()

            // Fetch the corresponding div from a list of divs and remove an item from the array
            ticketsArray.splice(idx,1)

            // Update the application state
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(ticketsArray))
        }
    })
}

function findTicketIdx(id) {
    return ticketsArray.findIndex((ticket) => {
        return ticket.id == id
    })
}

function handleLock(divToBeLocked, ticketId) {
    // Add an event listener to my lock
    // Inspect the current class of the lock 
    // Based on that, flip the class 
    // Based on the class, also make the content of the div editable

    const iconElement = divToBeLocked.querySelector(".ticket-lock > i")

    const taskAreaElement = divToBeLocked.querySelector('.task-area')

    iconElement.addEventListener('click', event => {

        // Find out the index of my ticket 
        const idx = findTicketIdx(ticketId)

        // Figure out the class of my icon & make it flipped
        

        const classOfIcon = iconElement.classList[1]

        if(classOfIcon == lockedClass) {
            // Remove the class
            iconElement.classList.remove(lockedClass)
            // Add the unlock class
            iconElement.classList.add(unlockedClass)
            // Make the content editable
            // taskAreaElement.focus()
            taskAreaElement.setAttribute('contenteditable', 'true')

             console.log(ticketsArray)
        } else {
            // Remove the class
            iconElement.classList.remove(unlockedClass)
            // Add the unlock class
            iconElement.classList.add(lockedClass)
            // Make the content uneditable
            taskAreaElement.setAttribute('contenteditable', 'false')

            // Update my application state
            ticketsArray[idx].value = taskAreaElement.innerText
            // console.log({ ticketsArray })

            // Update the application state
            localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(ticketsArray))
        }
        
    })
}

// Switching colors after the task is assigned
function handlePriorityChange(colorSwitch, id){
    const changeColor = colorSwitch.querySelector(".ticket-color")
    const idx = findTicketIdx(id)

    changeColor.addEventListener('click', () =>{
        const colorTag = changeColor.classList[1];
        // console.log(colorTag)


        const index = colorsArray.findIndex((elem) =>{
            return elem == colorTag
        })

        // console.log(colorTag, index)
        const newIdx = (index + 1) % colorsArray.length
        changeColor.classList.remove(colorTag)
        changeColor.classList.add(colorsArray[newIdx])

        ticketsArray[idx].type = colorsArray[newIdx]
        // console.log({ticketsArray})

        // Update the application state
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(ticketsArray))

    })
}