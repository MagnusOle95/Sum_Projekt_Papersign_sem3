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
  setDoc,
  getDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { Console } from "console";
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

let produkter = await getAllProducts();
let produktgrupper = await getAllProductgroups();
let fakturaer = await getAllFakturaer();
let ordrer = await getAllOrdrer();

async function getAllOrdrer() {
  let fakturaCollection = collection(db, "ordrer");
  let ordrer = await getDocs(fakturaCollection);
  let liste = ordrer.docs.map((doc) => {
    let data = doc.data();
    data.docID = doc.id;
    return data;
  });
  console.table(liste);
  return liste;
}

//Numre til id af produkter og produktgrupper. 
let result = await getAllNumbers();
let gruppeNr = result[3].gruppeNr;
let produktNr = result[1].produktNr;
let ordreNr = result[2].ordreNr;
let fakturaNr = result[0].fakturaNr;
console.log(result)

async function getAllFakturaer() {
  let fakturaCollection = collection(db, "fakturaer");
  let collection1 = await getDocs(fakturaCollection);
  let liste = collection1.docs.map((doc) => {
    let data = doc.data();
    data.docID = doc.id;
    return data;
  });
  console.table(liste);
  return liste;
}
async function getAllProductgroups() {
  let gruppeCollection = collection(db, "produktgrupper");
  let varegruppper = await getDocs(gruppeCollection);
  let liste = varegruppper.docs.map((doc) => {
    let data = doc.data();
    data.docID = doc.id;
    return data;
  });
  console.table(liste);
  return liste;
}

async function getAllNumbers() {
  let gruppeCollection = collection(db, "nummre");
  let nummre = await getDocs(gruppeCollection);
  let liste = nummre.docs.map((doc) => {
    let data = doc.data();
    data.docID = doc.id;
    return data;
  });
  return liste;
}

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
  produkter = await getAllProducts();
  response.render("kasse", {produkter: produkter});});

app.post("/opretProdukt", async (request, response) => {
  const { pNavn } = request.body;
  let nyProdukt = { navn: pNavn };
  addDoc(collection(db, "varer"), nyProdukt);
  response.sendStatus(201);
});

app.post("/opretProduktGruppe", async (request, response) => {
  const { produktGruppeNavn, produktGruppeBeskrivelse } = request.body;
  let nyProduktGruppe = logik.createProductgroup(produktGruppeNavn, produktGruppeBeskrivelse,gruppeNr)
  produktgrupper.push(nyProduktGruppe)
  let nyProduktGruppeFirebase = {navn : produktGruppeNavn, beskrivelse: produktGruppeBeskrivelse, gruppeNr: gruppeNr}
  await setDoc(doc(db,"produktgrupper",`${gruppeNr}`),nyProduktGruppeFirebase)
  gruppeNr++; 
  let gruppenrUpdate={gruppeNr: gruppeNr}
  await setDoc(doc(db,"nummre/gruppeNr"),gruppenrUpdate)
  response.sendStatus(201);
  });

app.post('/sletBesked', (request, response) => {
  console.log("Kommer her")
  // const { beskedId } = request.body;
  // let index = beskeder.findIndex(object => {
  //     return object.beskedNr == beskedId;
  //   });
  //   beskeder.splice(index, 1);
    
  // console.log(index)
  // response.sendStatus(201)

})

app.get("/kasse", async (request, response) => {
  response.render("kasse",  { fakturaer: fakturaer, produktgrupper: produktgrupper, produkter: produkter});
});

app.get("/underskrift", async (request, response) => {
  response.render("underskrift");
});

app.get("/crud/", async (request, response) => {
  produktgrupper = await getAllProductgroups();
  response.render("crud", { fakturaer: fakturaer, produktgrupper: produktgrupper, produkter: produkter});
});

app.get("/faktura/", async (request, response) => {
  response.render("faktura", { ordrer: ordrer, fakturaer: fakturaer, produktgrupper: produktgrupper, produktliste: produkter});
});

app.get("/crud/:data", async (request, response) => {
  let produktID = request.params.data;
  response.render("crud", { produktliste: produkter, produktID });
});

app.post("/seachProduktinGroup",async (request, respons) => {
  const { valgtGruppeNr } = request.body;
  console.log(produkter)
  console.log(valgtGruppeNr)
  let resultList = await logik.searchDynamic(produkter,"gruppeNr",valgtGruppeNr)
  console.log(resultList)
  console.log("Når her til")
  



})


app.get("/search", async (request, response) => {
  var attribut = request.query.attribut;
  var vaerdi = request.query.vaerdi;
  console.log("Attribut: " + attribut + " .   værdi: " + vaerdi)
  let searchresults = await logik.searchDynamic(produkter, attribut, vaerdi);
  response.render("search", { search: searchresults });
});

app.listen(port);

console.log("Lytter på port " + port);
 