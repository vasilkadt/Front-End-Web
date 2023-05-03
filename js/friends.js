import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    remove,
    child,
    get,
    update
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

const currentUserId = sessionStorage.getItem("currentUserId");

//JS for friends
const list = document.getElementById("list");
const meetingsList = document.getElementById("meetings-list");
const sendRequestBtn = document.getElementsByClassName("material-symbols-outlined")[0];
const allFriendsBtn = document.getElementsByClassName("material-symbols-outlined")[1];
const friendRequestsBtn = document.getElementsByClassName("material-symbols-outlined")[2];
const input = document.getElementById("friend-input");

sendRequestBtn.addEventListener("click", (event) => {
    const friendToAdd = input.value;
    searchFriend(friendToAdd);
    input.value = "";
});

getAllFriends();
meetingsList.style.display = "none";

allFriendsBtn.addEventListener("click", (event) => {
    clear(list);
    clear(meetingsList);
    document.getElementById("choosen-friend").innerText = `Choose one of your friends!`;
    meetingsList.style.display = "none";
    getAllFriends();
});

list.addEventListener("click", (event) => {
    const isViewCalendarClicked = event.target.classList.contains("view-calendar");
    const isDeleteClicked = event.target.classList.contains("delete-friend");
    const li = event.target.parentElement.parentElement;

    if (isDeleteClicked) {
        list.removeChild(li);
        remove(ref(database, "users/" + currentUserId + "/friends:/" + li.children[0].innerText))
        if (list.children.length === 0) {
            list.innerHTML = `<span class="no-friends">
             You do not have any friends yet
             </span>`;
        }
    }

    if (isViewCalendarClicked) {
        clear(meetingsList);
        meetingsList.style.display = "block";

        const friend = li.children[0].innerText;
        document.getElementById("choosen-friend").innerText = `${friend}'s meetings:`;
        getFriendMeetings(friend);
    }
});

friendRequestsBtn.addEventListener("click", (event) => {
    clear(list);
    document.getElementById("choosen-friend").innerText = `You cannot view meetings of requested users`;
    clear(meetingsList);
    meetingsList.style.display = "none";

    getFriendRequests();

    list.addEventListener("click", (event) => {
        const isAcceptedClicked = event.target.classList.contains("accept-friend");
        const isDeleteClicked = event.target.classList.contains("delete-friend");
        const li = event.target.parentElement.parentElement;

        if (isDeleteClicked) {
            list.removeChild(li);
            remove(ref(database, "users/" + currentUserId + "/friends:/" + li.children[0].innerText))
            if (list.children.length === 0) {
                list.innerHTML = `<span class="no-friends">
                No friend requests for today
                </span>`;
            }
        }

        if (isAcceptedClicked) {
            list.removeChild(li);

            updateFriends(currentUserId, li.children[0].innerText);
            findAndUpdateFriends(li.children[0].innerText);

            if (list.children.length === 0) {
                list.innerHTML = `<span class="no-friends">
                No friend requests for today
                </span>`;
            }
        }
    });
});


//Utility funvtions
function searchFriend(friend) {
    get(child(ref(database), "users/")).then((snapshot) => {
        if (snapshot.exists()) {
            const usersInDB = snapshot.val();
            var hasThisFriend = false;
            for (const key in usersInDB) {
                if (key !== currentUserId) {
                    if (usersInDB[key].username === friend) {
                        hasThisFriend = true;
                        makeFriendRequest(usersInDB[currentUserId].username, key);
                    }
                }
            }

            if (!hasThisFriend) {
                alert("No such user in this app!");
            }
        }
    }).catch((error) => {
        console.error(error);
    });
}

function makeFriendRequest(friend, friendId) {
    alert("Send request successfully!");
    set(
        ref(
            database,
            "users/" + friendId + "/friends:/" + friend + "/"
        ),
        {
            isPending: "true"
        }
    );
}

function getFriendRequests() {
    get(child(ref(database), "users/" + currentUserId + '/friends:')).then((snapshot) => {
        if (snapshot.exists()) {
            const friendRequests = snapshot.val();
            var noPendingRequests = true;

            for (const key in friendRequests) {
                if (friendRequests[key].isPending === "true") {
                    const li = document.createElement("li");
                    li.innerHTML = `
                 <span>${key}</span>
                 <div>
                 <button class="material-symbols-outlined accept-friend">Accept</button>
                 <button class="material-symbols-outlined delete-friend">Remove</button>
                 </div>`;
                    list.appendChild(li);
                    noPendingRequests = false;
                }
            }

            if (noPendingRequests) {
                list.innerHTML = `<span class="no-friends">
            No friend requests for today
              </span>`;
            }
        }
        else {
            list.innerHTML = `<span class="no-friends">
            No friend requests for today
          </span>`;
        }
    }).catch((error) => {
        console.error(error);
    });
}

function getAllFriends() {
    get(child(ref(database), "users/" + currentUserId + '/friends:')).then((snapshot) => {
        if (snapshot.exists()) {
            const friendRequests = snapshot.val();
            var noPendingRequests = true;

            for (const key in friendRequests) {
                if (friendRequests[key].isPending === "false") {
                    const li = document.createElement("li");
                    li.innerHTML = `
                 <span>${key}</span>
                 <div>
                 <button class="material-symbols-outlined view-calendar">View calendar</button>
                 <button class="material-symbols-outlined  delete-friend">Remove</button>
                 </div>`;
                    list.appendChild(li);
                    noPendingRequests = false;
                }
            }

            if (noPendingRequests) {
                list.innerHTML = `<span class="no-friends">
                You do not have any friends yet
                  </span>`;
            }
        }
        else {
            list.innerHTML = `<span class="no-friends">
            You do not have any friends yet
              </span>`;
        }
    }).catch((error) => {
        console.error(error);
    });
}

function updateFriends(first, second) {
    update(
        ref(
            database,
            "users/" + first + "/friends:/" + second + "/"
        ),
        {
            isPending: "false"
        }
    );
}

function findAndUpdateFriends(first) {
    get(child(ref(database), "users/")).then((snapshot) => {
        if (snapshot.exists()) {
            const usersInDB = snapshot.val();
            for (const key in usersInDB) {
                if (key !== currentUserId) {
                    if (usersInDB[key].username === first) {
                        updateFriends(key, usersInDB[currentUserId].username);
                    }
                }
            }
        }
    }).catch((error) => {
        console.error(error);
    });
}

function getFriendMeetings(friend) {
    get(child(ref(database), "users/")).then((snapshot) => {
        if (snapshot.exists()) {
            const usersInDB = snapshot.val();
            for (const key in usersInDB) {
                if (key !== currentUserId) {
                    if (usersInDB[key].username === friend) {
                        get(child(ref(database), "users/" + key + '/meetings:')).then((snapshot) => {
                            if (snapshot.exists()) {
                                const events = snapshot.val();
                                var noMeetings = true;

                                for (const key in events) {
                                    if (events[key].isPending === "false") {
                                        displayMeetings(key, events);
                                        noMeetings = false;
                                    }
                                }

                                if (noMeetings) {
                                    meetingsList.innerHTML = `<h3>
                                    ${friend} has no meetings yet
                                    </h3>`;
                                }
                            }
                            else {
                                meetingsList.innerHTML = `<h3>
                                ${friend} has no meetings yet
                                </h3>`;
                            }
                        })
                    }
                }
            }
        }
    }).catch((error) => {
        console.error(error);
    });
}

function displayMeetings(meetingName, events) {
    const li = document.createElement("li");

    li.innerHTML = `
      <div><br>
      <h3>${meetingName}</h3>
      <span>Date: ${events[meetingName].date}</span>
      <br><span>Start time: ${events[meetingName].startTime}</span>
      <br><span>End time: ${events[meetingName].endTime}</span>
      <br><span>Participants: ${events[meetingName].participants}</span>
      </div>
    `;

    meetingsList.appendChild(li);
}

function clear(list) {
    Array.from(list.querySelectorAll("li")).forEach((li) => {
        li.classList.add("hidden-list-item");
    });

    list.innerText = "";
    list.style.background = "white";
}