// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore,setDoc,doc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhkR5YBpXFY8CYJo4X0np5cRT4jK5tAvY",
  authDomain: "tutorialenglish-28697.firebaseapp.com",
  projectId: "tutorialenglish-28697",
  storageBucket: "tutorialenglish-28697.firebasestorage.app",
  messagingSenderId: "34348941749",
  appId: "1:34348941749:web:e7e5892bce912e512c59fc",
  measurementId: "G-2Z8JQMG94P"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

document.getElementById("submit").addEventListener("click",()=>{
  console.log("btnpressed")
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    signInWithEmailAndPassword(auth,email,password).then((userCredential)=> {
        const user = userCredential.user
        localStorage.setItem("loggedInUserId",user.uid)
        location.replace("index.html")
    }).catch((error)=>{
      if (error.code == 'auth/invalid-credential'){
        alert("Invalid email or password")
      } else {
        alert("That account does not exist")
      }
    })
})