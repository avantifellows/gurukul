import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyA94zc1GEle4hhh6pPe1GMoublv6Kae60o",
    authDomain: "staging-portal-7df0f.firebaseapp.com",
    projectId: "staging-portal-7df0f",
    storageBucket: "staging-portal-7df0f.appspot.com",
    messagingSenderId: "631798984229",
    appId: "1:631798984229:web:ff327cceff980940f219cc",
    measurementId: "G-QS80G2CVRN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
