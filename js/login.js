import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

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
const auth = getAuth(app);

const loginPerson = document.getElementsByClassName("login-user");
const loginBtn = document.querySelector(".btn");

const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
});

function validation(email, password) {
  if (email == null || email == "" || password == null || password == "") {
    alert("Please fill all the fields!");
    return false;
  } else if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return false;
  }
  else return true;
}

loginBtn.addEventListener("click", (event) => {
  const loginEmail = loginPerson[0].value;
  const loginPassword = loginPerson[1].value;

  if (validation(loginEmail, loginPassword)) {
    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      .then((userCredential) => {
        sessionStorage.clear();
        sessionStorage.setItem("currentUserId", userCredential.user.uid);
        sessionStorage.setItem("currentUserEmail", loginEmail);
        window.location.href = "./mainpage.html";
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });

    loginPerson[0].value = "";
    loginPerson[1].value = "";
  }
});
