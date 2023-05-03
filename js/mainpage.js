import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  remove,
  child,
  get,
  push,
  update,
  query,
  orderByChild
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAu40uPj31alBZXX8RRNlE_KdG_HKD0rIg",
  authDomain: "my-diary-b565e.firebaseapp.com",
  projectId: "my-diary-b565e",
  storageBucket: "my-diary-b565e.appspot.com",
  messagingSenderId: "908979705010",
  appId: "1:908979705010:web:1028caa30350f09cbe25ab",
  measurementId: "G-6B83F0TBGZ",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// JS for navbar
const dropdownBtn = document.getElementById("myDropdown");
const icon = document.querySelector(".icon");

document
  .getElementsByClassName("dropbtn")[0]
  .addEventListener("click", (event) => {
    document
      .getElementsByClassName("dropdown-content")[0]
      .classList.toggle("show");
  });

window.onclick = function (e) {
  if (!e.target.matches(".dropbtn")) {
    if (dropdownBtn.classList.contains("show")) {
      dropdownBtn.classList.remove("show");
    }
  }
};

icon.addEventListener("click", (event) => {
  var x = document.getElementById("nav");
  if (x.className === "navbar") {
    x.className += " responsive";
  } else {
    x.className = "navbar";
  }
});

//JS for calendar
var nav = 0;
var clicked = null;
var events = new Map();

const calendar = document.getElementById("calendar");
const newEventModal = document.getElementById("newEventModal");
const deleteEventModal = document.getElementById("deleteEventModal");
const eventTitleInput = document.getElementById("eventTitleInput");
const eventStartTime = document.getElementsByClassName("meeting-time")[1];
const eventEndTime = document.getElementsByClassName("meeting-time")[3];
const currentUserId = sessionStorage.getItem("currentUserId");
const currentUserEmail = sessionStorage.getItem("currentUserEmail");
const meetingPrticipants = document.getElementById("participants");
const timeline = document.querySelector(".timeline");
var LeftOrRight = true;

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

get(child(ref(database), "users/")).then((snapshot) => {
  if (snapshot.exists()) {
    const usersInDB = snapshot.val();
    for (const key in usersInDB) {
      if (key !== currentUserId) {
        const option = new Option(usersInDB[key].username);
        meetingPrticipants.appendChild(option);
      }
    }
  }
}).catch((error) => {
  console.error(error);
});

function load() {
  const dt = new Date();
  if (nav !== 0) {
    dt.setMonth(new Date().getMonth() + nav);
  }

  const day = dt.getDate();
  const month = new Date().getMonth() + nav;
  const year = dt.getFullYear();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateString = firstDayOfMonth.toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const paddingDays = weekdays.indexOf(dateString.split(", ")[0]);

  document.getElementById("monthDisplay").innerText = `${dt.toLocaleString(
    "en-US",
    { month: "long" }
  )} ${year}`;

  calendar.innerHTML = "";

  get(child(ref(database), "users/" + currentUserId + '/meetings:')).then((snapshot) => {
    if (snapshot.exists()) {
      events = snapshot.val();
      for (let i = 1; i <= paddingDays + daysInMonth; i++) {

        const daySquare = document.createElement("div");
        daySquare.classList.add("day");
        var daysToDisplay = i - paddingDays;
        var monthToDisplay = month + 1;

        if (daysToDisplay < 10) {
          daysToDisplay = '0' + daysToDisplay;
        }

        if (monthToDisplay < 10) {
          monthToDisplay = `0${monthToDisplay}`;
        }
        const dayString = `${monthToDisplay}/${daysToDisplay}/${year}`;
        var eventsPendingStatus = [];
        var eventsName = [];

        if (i > paddingDays) {
          daySquare.innerText = i - paddingDays;

          for (const key in events) {
            if (events[key].date === dayString) {
              eventsPendingStatus.push(events[key].isPending);
              eventsName.push(key);
            }
          }

          if (i - paddingDays === day && nav === 0) {
            daySquare.id = "currentDay";
          }

          const eventDiv = document.createElement("div");
          eventDiv.classList.add("event");
          
          for (let i = 0; i < eventsPendingStatus.length; i++) {
            if (eventsPendingStatus[i] === "false" && eventsName[i] !== "") {
              if (daySquare.children.length === 0) {
                eventDiv.innerText = eventsName[i];
                daySquare.appendChild(eventDiv);
              } else {
                eventDiv.innerText = eventsPendingStatus.length;
              }
            }
          }

          daySquare.addEventListener("click", () => openCreateMeetingForm(dayString));
        } else {
          daySquare.classList.add("padding");
        }
        calendar.appendChild(daySquare);
      }
    } else {
      for (let i = 1; i <= paddingDays + daysInMonth; i++) {
        const daySquare = document.createElement("div");
        daySquare.classList.add("day");
        let daysToDisplay = i - paddingDays;
        let monthToDisplay = month + 1;
        if (daysToDisplay < 10) {
          daysToDisplay = '0' + daysToDisplay;
        }

        if (monthToDisplay < 10) {
          monthToDisplay = `0${monthToDisplay}`;
        }
        const dayString = `${monthToDisplay}/${daysToDisplay}/${year}`;

        if (i > paddingDays) {
          daySquare.innerText = i - paddingDays;

          if (i - paddingDays === day && nav === 0) {
            daySquare.id = "currentDay";
          }

          daySquare.addEventListener("click", () => openCreateMeetingForm(dayString));
        } else {
          daySquare.classList.add("padding");
        }
        calendar.appendChild(daySquare);
      }
    }
  }).catch((error) => {
    console.error(error);
  });
}

const starCountRef1 = ref(database, 'users/' + currentUserId + '/meetings:');
onValue(starCountRef1, (snapshot) => {
  load();
  displayTimeline();
});

initButtons();

//JS for pending meetings
const list = document.getElementById("list");

get(child(ref(database), "users/" + currentUserId + '/meetings:')).then((snapshot) => {
  if (snapshot.exists()) {
    events = snapshot.val();
    var noPendingMeetings = true;

    for (const key in events) {
      if (events[key].isPending === "true") {
        displayPendingMeeting(key, events);
        noPendingMeetings = false;
      }
    }

    if (noPendingMeetings) {
      list.innerHTML = `<span class="no-meetings">
      No pending meetings for today
      </span>`;
      list.style.background = "#e8f4fa";
    }
  }
  else {
    list.innerHTML = `<span class="no-meetings">
    No pending meetings for today
    </span>`;
    list.style.background = "#e8f4fa";
  }
}).catch((error) => {
  console.error(error);
});

list.addEventListener("click", (event) => {
  const isDeleteClicked = event.target.classList.contains("delete-task");
  const li = event.target.parentElement.parentElement;
  const meetingToDelete = li.children[0].children[1];

  if (isDeleteClicked) {
    list.removeChild(li);
    remove(ref(database, "users/" + currentUserId + "/meetings:/" + meetingToDelete.innerText))
    if (list.children.length === 0) {
      list.innerHTML = `<span class="no-meetings">
      No pending meetings for today
      </span>`;
      list.style.background = "#e8f4fa";
    }
  }
});

list.addEventListener("click", (event) => {
  const isAcceptedClicked = event.target.classList.contains("accept-task");
  const li = event.target.parentElement.parentElement;
  const acceptedMeeting = li.children[0].children[1];

  if (isAcceptedClicked) {
    list.removeChild(li);

    update(
      ref(
        database,
        "users/" + currentUserId + "/meetings:/" + acceptedMeeting.innerText + "/"
      ),
      {
        isPending: "false"
      }
    );

    if (list.children.length === 0) {
      list.innerHTML = `<span class="no-meetings">
      No pending meetings for today
      </span>`;
      list.style.background = "#e8f4fa";
    }
  }
});

//JS for timeline
function displayTimeline() {
  const sortedMeetings = query(ref(database, "/users/" + currentUserId + "/meetings:"), orderByChild("date"));
  onValue(sortedMeetings, (snapshot) => {
    timeline.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
      const childKey = childSnapshot.key;
      const childData = childSnapshot.val();
      if (childData.isPending === "false") {
        acceptPendingMeetingGoesInTimeline(childKey, childData)
      }

    });
  }, {
    onlyOnce: true
  });
}

//JS for commenting post
timeline.addEventListener("click", (event) => {
  const isWriteCommentClicked = event.target.classList.contains("write");
  const isViewCommentsClicked = event.target.classList.contains("view");
  const meeting = event.target.parentElement.parentElement;

  if (isWriteCommentClicked) {
    writeComment(meeting);
  }

  if (isViewCommentsClicked) {
    getCommentsForMeeting(meeting);
  }
});

//Utility functions
function addComment(user, meetingName, commentContent) {
  const newCommentRef = push(
    ref(
      database,
      "users/" + user + "/meetings:/" + meetingName.innerText + "/comments:/"
    ));
  set(newCommentRef, {
    comment: commentContent + " by " + currentUserEmail
  });
}

function displayPendingMeeting(meetingName, events) {
  const li = document.createElement("li");

  li.innerHTML = `
    <div><br>
    <h3>${meetingName}</h3>
    <span>Date: ${events[meetingName].date}</span>
    <br><span>Start time: ${events[meetingName].startTime}</span>
    <br><span>End time: ${events[meetingName].endTime}</span>
    <br><span>Participants: ${events[meetingName].participants}</span>
    </div>
    <div>
    <button class="material-symbols-outlined accept-task">Accept</button>
    <button class="material-symbols-outlined delete-task">Deny</button>
    </div>
  `;

  list.appendChild(li);
}

function acceptPendingMeetingGoesInTimeline(key, event) {
  const description = document.createElement("div");
  if (LeftOrRight) {
    description.innerHTML = `
  <div class="container left">
  <div class="content">
  <h3>${key}</h3>
  <p>
   Date: ${event.date} <br> Start time: ${event.startTime} <br> End time: ${event.endTime} <br> Participants: ${event.participants}
  </p>
  <div class="comments">
  <button class="material-symbols-outlined comment-btn write">Write comment</button>
  <button class="material-symbols-outlined comment-btn view">View all comments</button>
  </div>
  </div>
  </div>`;
    LeftOrRight = false;
  } else {
    description.innerHTML = `
  <div class="container right">
  <div class="content">
  <h3>${key}</h3>
  <p>
   Date: ${event.date} <br> Start time: ${event.startTime} <br> End time: ${event.endTime} <br> Participants: ${event.participants}
  </p>
  <div class="comments">
  <button class="material-symbols-outlined comment-btn write">Write comment</button>
  <button class="material-symbols-outlined comment-btn view">View all comments</button>
  </div>
  </div>
  </div>`;
    LeftOrRight = true;
  }
  timeline.appendChild(description);
}

function writeComment(meeting) {
  const commentArea = document.createElement("div");
  commentArea.innerHTML = `
  <br>
  <textarea rows="4" cols="50">Write your comment here....</textarea>
  <br>
  <button class="material-symbols-outlined">Save comment</button>
  <button class="material-symbols-outlined">Quit</button>`;

  meeting.appendChild(commentArea);

  const saveCommentButton = commentArea.children[3];
  saveCommentButton.addEventListener("click", (event) => {
    const commentContent = commentArea.children[1].value;
    commentArea.children[1].value = "";

    addComment(currentUserId, meeting.children[0], commentContent);

    get(child(ref(database), "users/")).then((snapshot) => {
      if (snapshot.exists()) {
        const usersInDB = snapshot.val();
        for (const key in usersInDB) {
          if (key !== currentUserId) {
            addComment(key, meeting.children[0], commentContent);
          }
        }
      }
    }).catch((error) => {
      console.error(error);
    });

    meeting.removeChild(commentArea);
  });

  const quitCommentButton = commentArea.children[4];
  quitCommentButton.addEventListener("click", (event) => {
    meeting.removeChild(commentArea);
  });
}

function getCommentsForMeeting(meeting) {
  get(child(ref(database), "users/" + currentUserId + "/meetings:/" + meeting.children[0].innerText + "/comments:/")).then((snapshot) => {
    if (snapshot.exists()) {
      const commentCollection = snapshot.val();
      const div = document.createElement("div");
      const ui = document.createElement("div")
      Object.keys(commentCollection).forEach((key) => {
        const li = document.createElement("li");
        li.innerHTML = `
        <br>
        <br>
        <span>${commentCollection[key].comment}</span>
        <br>`;
        ui.appendChild(li);
      })
      div.innerHTML = `
      <button class="material-symbols-outlined">Hide comments</button>`;
      ui.appendChild(div);
      meeting.appendChild(ui);

      const hideCommentButton = div.children[0];
      hideCommentButton.addEventListener("click", (event) => {
        meeting.removeChild(ui);
      });
    }
    else {
      noCommentsMessege(meeting);
    }
  }).catch((error) => {
    console.error(error);
  });
}

function noCommentsMessege(meeting) {
  const li = document.createElement("li");
  const div = document.createElement("div");
  const ui = document.createElement("div")
  li.innerHTML = `
    <br>
    <br>
    <span>There are no comments for these meeting.</span>
    <br>`;
  div.innerHTML = `
  <button class="material-symbols-outlined">Hide comments</button>`;
  ui.appendChild(li);
  ui.appendChild(div);
  meeting.appendChild(ui);

  const hideCommentButton = div.children[0];
  hideCommentButton.addEventListener("click", (event) => {
    meeting.removeChild(ui);
  });
}

function openCreateMeetingForm(date) {
  clicked = date;

  var eventsForSelectedDay = [];
  var eventNamesForSelectedDay = [];
  const eventsList = document.getElementById("eventText");

  for (const key in events) {
    if (events[key].date === clicked) {
      eventsForSelectedDay.push(events[key]);
      eventNamesForSelectedDay.push(key);
    }
  }
  if (!eventsForSelectedDay.find(event => event.isPending == "false")) {
    newEventModal.style.display = "block";
  } else {
    eventsList.innerHTML = "";
    for (let i = 0; i < eventsForSelectedDay.length; i++) {
      if (eventsForSelectedDay[i].isPending == "false") {
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="no-meetings">${eventNamesForSelectedDay[i]}</span>
          <button class="removeBtn">X</button>
          `;
        eventsList.appendChild(li);
      };
    }
    deleteEventModal.style.display = "block";
  }
}

function closeModal() {
  eventTitleInput.classList.remove("error");
  newEventModal.style.display = "none";
  deleteEventModal.style.display = "none";
  eventTitleInput.value = "";
  eventStartTime.value = "";
  eventEndTime.value = "";
  meetingPrticipants.value = "";
  clicked = null;
}

function saveEvent() {
  get(child(ref(database), "users/")).then((snapshot) => {
    if (snapshot.exists()) {
      const usersInDB = snapshot.val();

      if (eventTitleInput.value && eventStartTime.value && eventEndTime.value && meetingPrticipants.value) {
        eventTitleInput.classList.remove("error");

        var selected = [];
        for (var option of meetingPrticipants) {
          if (option.selected) {
            selected.push(option.value);
          }
        }

        set(
          ref(
            database,
            "users/" + currentUserId + "/meetings:/" + eventTitleInput.value + "/"
          ),
          {
            date: clicked,
            startTime: eventStartTime.value,
            endTime: eventEndTime.value,
            participants: selected + "," + usersInDB[currentUserId].username,
            isPending: "false"
          }
        );

        //Add pending meetings
        for (var participant of selected) {
          for (const key in usersInDB) {
            if (key !== currentUserId) {
              if (usersInDB[key].username === participant) {
                set(
                  ref(
                    database,
                    "users/" + key + "/meetings:/" + eventTitleInput.value + "/"
                  ),
                  {
                    date: clicked,
                    startTime: eventStartTime.value,
                    endTime: eventEndTime.value,
                    participants: selected + "," + usersInDB[currentUserId].username,
                    isPending: "true"
                  }
                );
              }
            }
          }
        }

        closeModal();
      }
    }
  }).catch((error) => {
    console.error(error);
  });
}

function deleteEvent(listItemToDelete) {
  const meetingToDelete = listItemToDelete.children[0];
  listItemToDelete.innerHTML = ``;
  remove(ref(database, "users/" + currentUserId + "/meetings:/" + meetingToDelete.innerText));
}

function initButtons() {
  document.getElementById("nextButton").addEventListener("click", () => {
    nav++;
    load();
  });

  document.getElementById("backButton").addEventListener("click", () => {
    nav--;
    load();
  });

  document.getElementById("saveButton").addEventListener("click", saveEvent);
  document.getElementById("cancelButton").addEventListener("click", closeModal);
  document.getElementById("closeButton").addEventListener("click", closeModal);
  document.getElementById("addButton").addEventListener("click", () => {
    deleteEventModal.style.display = "none";
    newEventModal.style.display = "block";
  });

  
  document.getElementById("eventText").addEventListener("click", (event) => {
    const isButton = event.target.nodeName === 'BUTTON';
    if (isButton) {
      deleteEvent(event.target.parentElement);
    }
  });
}