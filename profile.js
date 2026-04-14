// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth,onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore,getDoc,doc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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

onAuthStateChanged(auth,(user)=>{
    const loggedInUserId = localStorage.getItem("loggedInUserId");
    if (loggedInUserId){
        const docRef = doc(db,"users",loggedInUserId)
        getDoc(docRef).then((docSnap) =>{
            if (docSnap.exists()){
                const userData = docSnap.data();
                document.getElementById("usernameDisplay").innerHTML = "You are logged in as " + userData.username
                document.getElementById("emailDisplay").innerHTML = "Email: " + userData.email
            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        })

    } else {
        location.replace("register.html")
    }
})