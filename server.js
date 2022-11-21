import logik from "./logik.js";

//laver express server.
const port = 6969;
import express from "express"; //Ændret til import. ved brug af firebase
const app = express();

//Opretter view.
let pug = import("pug");
import path from "path";
const { request } = import("http");
const { response } = import("express");
app.set("view engine", "pug");
app.set("views", "views/");

app.use(express.json());

//Importer til __DirName
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Firebase filer.
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
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
  appId: "1:477663863462:web:f765c4665f9f0610fd4a67",
};

// Initialize Firebase
const appFireBase = initializeApp(firebaseConfig);
const db = getFirestore(appFireBase);

let produkterServerList = [];

let products = await getAllProducts();; 



let valueForView = { produkter: produkterServerList };

async function getAllProducts() {
  let varerCollection = collection(db, "varer");
  let varer = await getDocs(varerCollection);
  let vareliste = varer.docs.map((doc) => {
    let data = doc.data();
    data.docID = doc.id;
    return data;
  });
  console.table(vareliste);
  return vareliste;
}
app.get("/", async (request, response) => {
  products = await getAllProducts();
  response.render("kasse", valueForView);
});
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

app.post("/opretProdukt", async (request, response) => {
  const { pNavn } = request.body;
  let nyProdukt = { navn: pNavn };
  addDoc(collection(db, "varer"), nyProdukt);
  response.sendStatus(201);
});

app.get("/underskrift", async (request, response) => {
  response.render("underskrift", valueForView);
});

app.get("/crud/:data", async (request, response) => {
    let produktID = request.params.data;
    let produkter = products;
    response.render("crud", {produktliste: produkter});
  });

app.get("/search", async (request, response) => {
  let array = products;
  var attribut = request.query.attribut;
  var vaerdi = request.query.vaerdi;
  console.log("Søgeparametre: attribut:" + attribut + "  Værdi: " + vaerdi);
  let searchresults = await searchResults(attribut, vaerdi);
  console.log(searchresults);
  response.render("search", { search: searchresults });
});

async function searchResults(attribut, searchString){
    // 2 searchRecipe Funktioner for at søge både "under" og "over" søgestringen. (ellers skulle man bruge en 3.parts søgeAPI, som koster penge) 
    const items = await searchProduct(attribut, searchString); // <= 
    const items2 = await searchProduct2(attribut, searchString); // >
    let allItems = items.concat(items2);
    let produktliste = [];
    for(let i = 0; i < allItems.length; i++){
        if(allItems[i].navn <= searchString){
            produktliste.push(allItems[i]);
        }
    }
    return produktliste;
  }
  // mindre end! <=
  async function searchProduct(attribut, produktnavn) {
    let varerCol = collection(db, "varer");
    let q = query(varerCol, where("navn", "<=", produktnavn));
    let vare = await getDocs(q);
    let vareList = vare.docs.map((doc) => {
      let data = doc.data();
      data.docID = doc.id;
      return data;
    });
    return vareList;
  }
  // større end >
  async function searchProduct2(attribut, produktnavn) {
    let varerCol = collection(db, "varer");
    let q = query(varerCol, where("navn", ">", produktnavn));
    let vare = await getDocs(q);
    let vareList = vare.docs.map((doc) => {
      let data = doc.data();
      data.docID = doc.id;
      return data;
    });
    return vareList;
  }

app.listen(port);

console.log("Lytter på port " + port);
