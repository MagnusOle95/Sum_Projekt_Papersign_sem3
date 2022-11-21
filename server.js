import logik from './logik.js';

//laver express server. 
const port = 6969
import express from 'express'; //Ændret til import. ved brug af firebase
const app = express();

//Opretter view. 
let pug = import('pug');
import path from "path";
const { request } = import('http');
const { response } = import('express');
app.set('view engine','pug');
app.set('views',('views/'));

app.use(express.json());

//Importer til __DirName 
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


//Firebase filer. 
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc, addDoc, getDoc, query, where } from 'firebase/firestore'
//import{storage} from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCwMpbafG7AkNlU28omo8MDhA7ZgIh7BlA",
    authDomain: "papersign-19cd5.firebaseapp.com",
    projectId: "papersign-19cd5",
    storageBucket: "papersign-19cd5.appspot.com",
    messagingSenderId: "477663863462",
    appId: "1:477663863462:web:f765c4665f9f0610fd4a67"
  };

// Initialize Firebase
const appFireBase = initializeApp(firebaseConfig);
const db = getFirestore(appFireBase);

//Besked liste 
let produkterServerList = [];

//attribut 
let beskedNrCount = 2

//Liste over rum og beskeder. 
// let beskeder = [{ afsender: "Ole", tekst: "Min første besked", chatrum: "Rum1", beskedNr: 0}, { afsender: "Ib", tekst: "Hallo, er der nogen?", chatrum: "Rum2", beskedNr: 1}];
// let chatRum = [{ navn: "Rum1" }, { navn: "Rum2" }];

let valueForView = {produkter: produkterServerList };

app.get("/",(request,response) =>{
    response.render('kasse',valueForView)
})
// //-------------------------------------------------------------------------------------------------
// app.post('/produkter',async (request, response) => {
//     let produktCol=collection(db, 'vare');
//     let produkterFireBase = await getDocs(produktCol);
//     console.log(produkter.docs)

//     produkterServerList.length = 0;
//     //const { rumNavn } = request.body;
//     for (let p of produkterFireBase.docs){
//         let produkt = p._document.data.value.mapValue.fields
//        // if (besked.chatrum.stringValue == rumNavn){
//             produkterServerList.push({navn: produkt.navn.stringValue, produktId: p.id})
//       //  }
//     }
//     response.sendStatus(201);
//     console.log("Kommer her")
// })


app.post('/opretProdukt',async (request, response) => {
    const { pNavn } = request.body;
    let nyProdukt = {navn: pNavn}
    addDoc(collection(db,'varer'), nyProdukt)
    response.sendStatus(201);
})

app.get('/underskrift',async (request, response) => {
    response.render('underskrift',valueForView)
})

app.get('/search/:attribute/:vaerdi',async (request, response) => {
    let array = logik.getProducts();
    let attribut = request.query.attribute;
    console.log(attribut);
    let soegevaerdi = request.query.soegevaerdi;
    const searchResult = await logik.searchDynamic(array, attribut, soegevaerdi);
    response.render('search', {search: searchResult})
})


app.listen(port);

console.log("Lytter på port " + port);

