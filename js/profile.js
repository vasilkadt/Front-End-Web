import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
    getDatabase,
    ref,
    onValue,
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

//JS for navbar
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


//Js for profile
const currentUserId = sessionStorage.getItem("currentUserId");
const username = document.querySelector(".card__name");
const email = document.querySelector(".card__profession");
const infoUsername = document.querySelector(".info__name");

const starCountRef = ref(database, 'users/');
onValue(starCountRef, (snapshot) => {
    const usersInDB = snapshot.val();
    for (const key in usersInDB) {
        if (key === currentUserId) {
            const currentUserName = usersInDB[key].username;
            const currentUserEmail = usersInDB[key].email;
            username.innerHTML = currentUserName;
            email.innerHTML = currentUserEmail;
            infoUsername.innerHTML=currentUserName;
        }
    }
});