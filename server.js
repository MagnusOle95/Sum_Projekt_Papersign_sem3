import logik from "./logik.js";
// import ordre from "ordre.js"

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

app.use(express.static(path.join(__dirname, 'public')));

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
import { get } from "http";
import { DefaultDeserializer } from "v8";
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
let ProduktInProduktGoup = [];
let kurv = [];
let pgid = -1;
let total = 0;
let valgtGruppeNrS;
let valgtProduktNrS;
let betalt = 0;
let betallinger = [];
let darkmode = true;


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
let gruppeNr = result[1].gruppeNr;
let produktNr = result[3].produktNr;
let ordreNr = result[2].ordreNr;
let fakturaNR = result[0].fakturaNr;
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
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    else if (pgid == -1) { pgid = 'visalt' }
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    let lavP = lagerStatus();    
    response.render("kasse", { pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt), lavP: lavP });
});

// app.post("/opretProdukt", async (request, response) => {
//     const { pNavn } = request.body;
//     let nyProdukt = { navn: pNavn };
//     addDoc(collection(db, "varer"), nyProdukt);
//     response.sendStatus(201);
// });

app.post("/opretProduktGruppe", async (request, response) => {
    const { produktGruppeNavn, produktGruppeBeskrivelse } = request.body;
    let nyProduktGruppe = logik.createProductgroup(produktGruppeNavn, produktGruppeBeskrivelse, gruppeNr)
    produktgrupper.push(nyProduktGruppe)
    let nyProduktGruppeFirebase = { navn: produktGruppeNavn, beskrivelse: produktGruppeBeskrivelse, gruppeNr: gruppeNr }
    await setDoc(doc(db, "produktgrupper", `${gruppeNr}`), nyProduktGruppeFirebase)
    gruppeNr++;
    let gruppenrUpdate = { gruppeNr: gruppeNr }
    await setDoc(doc(db, "nummre/gruppeNr"), gruppenrUpdate)
    valgtGruppeNrS = undefined;
    response.sendStatus(201);
});

app.post('/deleteProductGroup', async (request, response) => {
    const { aktuelGroupNr } = request.body;
    console.log(aktuelGroupNr + " Se her")
    await deleteDoc(doc(db, 'produktgrupper', aktuelGroupNr));
    response.sendStatus(201)
    valgtGruppeNrS = undefined;
    console.log(aktuelGroupNr)
})

app.post('/updateProduktGroup', async (request, response) => {
    const { aktuelGroupNr, produktGruppeNavn, produktGruppeBeskrivelse } = request.body;
    let updatetProduktGroup = { navn: produktGruppeNavn, beskrivelse: produktGruppeBeskrivelse, gruppeNr: aktuelGroupNr }
    await setDoc(doc(db, "produktgrupper/" + aktuelGroupNr), updatetProduktGroup)
    valgtGruppeNrS = undefined;
    response.sendStatus(201)
})


app.post("/opretProdukt", async (request, response) => {
    const { gruppeNr, produktNavn, produktPris, produktAntal, leveradør, bestillingsnummer } = request.body;
    let nyProdukt = logik.createProduct(produktNavn,produktPris,produktAntal,leveradør,bestillingsnummer,gruppeNr,produktNr)
    produkter.push(nyProdukt)
    ProduktInProduktGoup.push(nyProdukt)
    let nyProduktFirebase = { gruppeNr: gruppeNr, navn: produktNavn, pris: produktPris, antal: produktAntal, leveradør: leveradør, bestillingsnummer: bestillingsnummer, produktNr: produktNr }
    await setDoc(doc(db, "varer", `${produktNr}`), nyProduktFirebase)
    produktNr++;
    let produktnrUpdate = { produktNr: produktNr }
    await setDoc(doc(db, "nummre/produktNr"), produktnrUpdate)
    valgtProduktNrS = undefined;
    response.sendStatus(201);
});

app.post('/deleteProdukt', async (request, response) => {
    const { aktuelProduktNr } = request.body;
    await deleteDoc(doc(db, 'varer', aktuelProduktNr));

    //Her finder jeg hvor i arrayet produkterne befinder sig og sletter dem. 
    for(let i = 0; i < produkter.length; i++){
        if(produkter[i].produktNr == aktuelProduktNr){
            produkter.splice(i,1);
        }
    for(let i = 0; i < ProduktInProduktGoup.length; i++){
        if(ProduktInProduktGoup[i].produktNr == aktuelProduktNr){
            ProduktInProduktGoup.splice(i,1);
            }
        }
     }
    valgtProduktNrS = undefined;
    response.sendStatus(201)
})

app.post('/updateProdukt', async (request, response) => {
    console.log("Test virker")
    const { aktuelProduktNr,gruppeNr, produktNavn, produktPris, produktAntal, leveradør, bestillingsnummer } = request.body;
    let updatetProdukt = { gruppeNr: gruppeNr, navn: produktNavn, pris: produktPris, antal: produktAntal, leveradør: leveradør, bestillingsnummer: bestillingsnummer, produktNr: aktuelProduktNr }
    console.log(updatetProdukt)
    await setDoc(doc(db,"varer/" + aktuelProduktNr),updatetProdukt)

    //Her finder jeg hvor i arrayet produkterne befinder sig og opdatere dem. 
    for(let i = 0; i < produkter.length; i++){
        if(produkter[i].produktNr == aktuelProduktNr){
            produkter[i] = {gruppeNr: gruppeNr, navn: produktNavn, pris: produktPris, antal: produktAntal, leveradør: leveradør, bestillingsnummer: bestillingsnummer, produktNr: aktuelProduktNr }
        }
    }
    for(let i = 0; i < ProduktInProduktGoup.length; i++){
        if(ProduktInProduktGoup[i].produktNr == aktuelProduktNr){
            ProduktInProduktGoup[i] = {gruppeNr: gruppeNr, navn: produktNavn, pris: produktPris, antal: produktAntal, leveradør: leveradør, bestillingsnummer: bestillingsnummer, produktNr: aktuelProduktNr }
        }
    }
    valgtProduktNrS = undefined;
    response.sendStatus(201)
  })



//   app.post("/opretOrdre", async (request, response) => {
//     const { antal, dato,ordrerlinjenr,produkt,total } = request.body;
//     let nyOrdreFirebase = {antal: antal,dato: dato,ordrerlinjenr: ordrerlinjenr,produkt: produkt, total: total}
//     await setDoc(doc(db,"ordrer",`${ordreNr}`),nyOrdreFirebase)  
//     ordreNr++;
//     let ordreNrUpdate={ordreNr: ordreNr}
//     await setDoc(doc(db,"nummre/gruppeNr"),ordreNrUpdate)
//   })

//   app.post("/opretFaktura", async (request, response) => {
//     const {navn,dato,ordrelinjer,fakturaNr} = request.body;
//     let fakturaNy=ordre.createFaktura(navn);
//     fakturaNy.fakturanr=fakturaNR;
//     fakturaer.push(fakturaNy);
//     let nyFakturaFirebase = {navn: navn, dato: dato, ordrelinjer: ordrelinjer, fakturaNr: fakturaNr}
//     await setDoc(doc(db,"ordrer",`${ordreNr}`),nyFakturaFirebase)  
//     fakturaNR++;
//     let fakturaNrUpdate={fakturaNr: fakturaNR}
//     await setDoc(doc(db,"nummre/gruppeNr"),fakturaNrUpdate)
//   })


app.get("/underskrift", async (request, response) => {
    response.render("underskrift", { ordrer: ordrer, fakturaer: fakturaer, produktgrupper: produktgrupper, produktliste: produkter, kurv: kurv, total: total,fakturaNr: fakturaNR});
});
app.post("/underskrift", async (request,response)=>{
    let fakturanrUpdate = { fakturaNR: fakturaNR }
    fakturaNR++;
    await setDoc(doc(db, "nummre/fakturaNr"), fakturanrUpdate)
    response.sendStatus(201);
})


app.get("/crud/", async (request, response) => {
    produktgrupper = await getAllProductgroups();
    let openedBySeach = 0;
    response.render("crud", { fakturaer: fakturaer, produktgrupper: produktgrupper, produkter: produkter, ProduktInProduktGoup: ProduktInProduktGoup, valgtGruppeNr: valgtGruppeNrS, valgtProduktNr: valgtProduktNrS, openedBySeach: openedBySeach });
});

app.get("/crud/:id&:id2", async (request, response) => {
  let produktGId = request.params.id;
  let produktId = request.params.id2
  console.log("gruppe id = " + produktGId + " Produkt id =" + produktId)
  ProduktInProduktGoup = searchProductByGroupNr(produktGId)
  let openedBySeach = 1;
  response.render("crud", { fakturaer: fakturaer, produktgrupper: produktgrupper, produkter: produkter, ProduktInProduktGoup: ProduktInProduktGoup, valgtGruppeNr: produktGId, valgtProduktNr: produktId, openedBySeach: openedBySeach });

});

app.get("/ordre/:data", async (request, response) => {
  let ordreID = request.params.data;
  let specifikOrdre = getOrdre(ordreID);
  response.render("ordre", { specifikOrdre, ordrer: ordrer, fakturaer: fakturaer, produktgrupper: produktgrupper, produktliste: produkter });
});

app.get("/faktura/", async (request, response) => {
    ordrer = await getAllOrdrer();
    response.render("faktura", {ordrer: ordrer, fakturaer: fakturaer, produktgrupper: produktgrupper, produktliste: produkter, kurv: kurv });
});

//---------------------------------------------------------------------------------------------(Kasse) 

//TODO fjern tilføj delen fra /kasse og lav forbindelse til /kassetilfoej paa tilfoej knap

//Kasse gennere kassen
app.get("/kasse", async (request, response) => {
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    //add to kurv
    response.render("kasse", { darkmode: darkmode, pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt) });
});

//Kasse annulere køb
app.get("/kasseannullere", async (request, response) => {
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    // let antal = request.query.antal;
    // let produktList = request.query.produktList;
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    //add to kurv
    kurv = [];
    betallinger = [];
    betalt = 0;
    total = 0;
    response.render("kasse", {pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt) });
});

//Kasse tilføj produkt til kurv
app.get("/kassetilfoej", async (request, response) => {
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    let antal = request.query.antal;
    let produktList = request.query.produktList;
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    //add to kurv
    if (antal != undefined && produktList != undefined) {
        let splitProduct = produktList.split(".")
        addToKurv(antal, splitProduct[0], splitProduct[1], splitProduct[2]);
        sumTotal();
    }
    response.render("kasse", { pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt) });
});

//Kasse slet produkt fra kurv
app.get("/kasseslet", async (request, response) => {
    // check if pgid is changed and chang
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    // let tempkurv = request.query.kurv;
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    //get index of product
    let productIndex = containsOrdre(request.query.kurv)
    //splice
    kurv.splice(productIndex, 1);
    sumTotal();
    response.render("kasse", { pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt) });
});

//Kasse set rabat på produkt (pris pr stk pris ændring)
app.get("/kasserabat", async (request, response) => {
    // check if pgid is changed and chang
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    //get index of product
    let productIndex = containsOrdre(request.query.kurv)
    let rabat = request.query.rabat;
    if (rabat != undefined && productIndex !== false) {
        kurv[productIndex].pris = rabat
        kurv[productIndex].total = Number(kurv[productIndex].pris) * Number(kurv[productIndex].antal)
    }
    sumTotal();
    response.render("kasse", { pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt) });
});

//Kasse set rabat på produkt (pris pr stk pris ændring)
app.get("/kassebetal", async (request, response) => {
    // check if pgid is changed and chang
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    let beloeb = request.query.beloeb;
    let betalling = request.query.betalling;
    if (beloeb != undefined && betalling != undefined) {
        betalBeloeb(beloeb, betalling)
    }
    //genenmføre købet
    if (betalt >= total) {
        //Opretter ordre
        let d = new Date();
        let datoidag = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
        let nyOrdreFirebase = { samletpris: total, dato: datoidag, betalingsmetode: betallinger, navn: "", ordreNr: ordreNr, ordrelinjer: kurv, underskrift: false }
        //Sender odre til firebase
        await setDoc(doc(db, "ordrer", `${ordreNr}`), nyOrdreFirebase)
        ordreNr++;
        let ordreNrUpdate = { ordreNr: ordreNr }
        await setDoc(doc(db, "nummre/ordreNr"), ordreNrUpdate)
        // Opdatere lager beholdningen på firebase
        for (let k of kurv) {
            // await setDoc(doc(db, "ordrer", `${ordreNr}`), nyOrdreFirebase)
            // ordreNr++;
            let produkterFB = await getAllProducts();
            // let pIndexFB = produkterFB.indexOf(k.produktnr)
            let pIndexFB = findDetSkideProdukt(produkterFB, k.produktnr, "produktNr")
            let productFB = produkterFB[pIndexFB]
            let nyAntal = produkterFB[pIndexFB].antal - k.antal
            produkterFB[pIndexFB].antal = nyAntal
            await setDoc(doc(db, "varer/" + k.produktnr), productFB)
        }
        //Nulstiller kasse apperatet 
        kurv = [];
        betallinger = [];
        betalt = 0;
        total = 0;
        //Opdater lokal data
        produkter = await getAllProducts();
        // fakturaer = await getAllFakturaer();
        ordrer = await getAllOrdrer();
    }
    // Beregner total
    sumTotal();
    // Genindlæser kasse apperatet 
    response.render("kasse", { pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt) });
});

//   app.post("/opretOrdre", async (request, response) => {
//     const { antal, dato,ordrerlinjenr,produkt,total } = request.body;
//     let nyOrdreFirebase = {antal: antal,dato: dato,ordrerlinjenr: ordrerlinjenr,produkt: produkt, total: total}
//     await setDoc(doc(db,"ordrer",`${ordreNr}`),nyOrdreFirebase)  
//     ordreNr++;
//     let ordreNrUpdate={ordreNr: ordreNr}
//     await setDoc(doc(db,"nummre/gruppeNr"),ordreNrUpdate)
//   })

//Kasse gennemfør betalt køb
// app.post("/kassegennemfoerkoeb", async (request, response) => {
//     let d = new Date();
//     let datoidag = d.getDate + "-" + d.getMonth + "-" + d.getFullYear;
//     let nyOrdreFirebase = { samletpris: total, dato: datoidag, betalingsmetode: betallinger, navn: "Intet", ordreNr: ordreNr, ordrelinjer: kurv, underskrift: false }
//     await setDoc(doc(db, "ordrer", `${ordreNr}`), nyOrdreFirebase)
//     ordreNr++;
//     let ordreNrUpdate = { ordreNr: ordreNr }
//     await setDoc(doc(db, "nummre/ordreNr"), ordreNrUpdate)
//     response.sendStatus(201);
// });

//---------------------------------------------------------------------------------------------()


app.post("/seachProduktinGroup", async (request, response) => {
    const { valgtGruppeNr } = request.body;
    ProduktInProduktGoup = searchProductByGroupNr(valgtGruppeNr)
    valgtGruppeNrS = valgtGruppeNr;
    valgtProduktNrS = undefined;
    response.sendStatus(201);
})

app.post("/aktuelProduktNrTilServer", async (request, response) => {
    const { aktuelProduktNr } = request.body;
    valgtProduktNrS = aktuelProduktNr;
    response.sendStatus(201);
})


app.get("/search", async (request, response) => {
    var attribut = request.query.atribut;
    var vaerdi = request.query.value;
    let searchresults = await logik.searchDynamic(produkter, attribut, vaerdi);
    response.render("search", { search: searchresults });
});

app.listen(port);

console.log("Lytter på port " + port);

//Metoder--------------------------------------------------------------------------------------------------------------------------------------------------
function searchProductByGroupNr(gruppeNr) {
    if (gruppeNr == "visalt") return produkter;
    let list = [];
    //let products = getProducts() // hent alle produkterne, i arrayet "produkter" fra server.js - måske navnet er forkert, eller også er der ingen getProducts, til den?)
    for (let i = 0; i < produkter.length; i++) {
        if (produkter[i].gruppeNr == gruppeNr) {
            list.push(produkter[i]);
        }
    }
    return list;
}

function addToKurv(antal, pNr, navn, pris) {
    let total = antal * pris;
    let ordre = { produktnr: pNr, antal: antal, navn: navn, pris: pris, total: total };
    let found = containsOrdre(navn);
    if (found !== false) {
        if (kurv[found].pris != pris) {
            total = antal * kurv[found].pris;
        }
        kurv[found].total += total
        kurv[found].antal = Number(kurv[found].antal) + Number(antal)
    }
    else {
        kurv.push(ordre);
    }
}

//TODO fjern tempkurv

function containsOrdre(searchvalue) {
    let tempkurv = kurv;
    let found = false;
    let index = 0
    while (found === false && index < tempkurv.length) {
        let obj = tempkurv[index]
        if (obj.navn == searchvalue) {
            found = index;
        }
        else index++;
    }
    return found;
}

function sumTotal() {
    total = 0;
    for (let k of kurv) {
        total += k.total;
    }
}

function getOrdre(ordreID){
  console.table(ordrer);
  console.log(ordrer[0].docID);
  for(let i = 0; i<ordrer.length; i++){
    if(ordrer[i].docID == ordreID){
      return ordrer[i];
    }
  }
}


function betalBeloeb(beloeb, betalling) {
    betalt += Number(beloeb);
    betallinger.push({ beloeb: beloeb, betalling: betalling });
}

function findDetSkideProdukt(produkter, soegevaerdi, atribute) {
    let found = false
    let i = 0;
    while (i < produkter.length && found === false) {
        let p = produkter[i];
        if (p[atribute] == soegevaerdi) {
            found = i;
        }
        else {
            i++;
        }
    }
    return found;
}

function lagerStatus(){
    let lavLagerStatus = [];
    for (let p of produkter) {
        if(p.antal<=5){
            lavLagerStatus.push(p)
        }
    }
    return lavLagerStatus;
}