import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
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
const database = getDatabase(app);

const signupBtn = document.getElementsByClassName("btn")[1];
const signupPerson = document.getElementsByClassName("signup-user");

const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
});

function validation(name, email, password, repeatedPassword) {
  if (
    name == null ||
    name == "" ||
    email == null ||
    email == "" ||
    password == null ||
    password == "" ||
    repeatedPassword == null ||
    repeatedPassword == ""
  ) {
    alert("Please fill all the fields!");
    return false;
  } else if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return false;
  } else if (password !== repeatedPassword) {
    alert("Repeated password must be same with password.");
    return false;
  } else return true;
}

signupBtn.addEventListener("click", (event) => {
  const signupName = signupPerson[0].value;
  const signupEmail = signupPerson[1].value;
  const signupPassword = signupPerson[2].value;
  const signupRepeatedPassword = signupPerson[3].value;

  if (
    validation(signupName, signupEmail, signupPassword, signupRepeatedPassword)
  ) {
    createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("Successfully created account!");

        set(ref(database, "users/" + user.uid), {
          username: signupName,
          email: signupEmail,
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });

    signupPerson[0].value = "";
    signupPerson[1].value = "";
    signupPerson[2].value = "";
    signupPerson[3].value = "";
  }
});
