let varenr = 0; // tælles op automatisk af inde i constructoren
let products = []; // varer tilføjes automatisk her, når de oprettes.
let productgroups = []; // all produktgrupper (en del af alle produkter)

function createProduct(navn, pris, antal, EAN, leverandør, bestillingsnummer, produktgruppe,produktNr) {
  let product = new Product(navn, pris, antal, EAN, leverandør, bestillingsnummer, produktgruppe, produktNr);
  products.push(product);
  produktgruppe.produkter.push(this); // prouktet puttes ind i produktgruppes liste, over de forskellige produkter, som den har
  return product;
}

function createProductgroup(navn, beskrivelse,GruppeNr) {
  let productgroup = new Productgroup(navn, beskrivelse,GruppeNr);
  //productgroups.push(productgroup);
  return productgroup;
}

function getProductgroup() {
  return productgroups;
}

function removeAttribute(produkt, attribut) {
  produkt.removeAttribute(attribut);
}
// TODO, måske: setNewProduktgruppe (undergruppe)
function setNewAttribute(produkt, attribut, værdi) {
  produkt.setAttribute(attribut, værdi);
}

class Product {
  constructor(navn, pris, antal, EAN, leverandør, bestillingsnummer, produktgruppe,produktNr) {
    this.navn = navn;
    this.pris = pris;
    this.antal = antal;
    this.EAN = EAN;
    this.leverandør = leverandør;
    this.bestillingsnummer = bestillingsnummer;
    this.produktgruppe = produktgruppe;
    this.produktNr = produktNr;
  }
}

class Productgroup {
  constructor(navn, beskrivelse,GruppeNr) {
    this.navn = navn;
    this.beskrivelse = beskrivelse;
    this.produkter = [];
    this.GruppeNr = GruppeNr;
  }
}

// tilføjer produktet på arrayet, hvis det ikke er der i forvejen.
function addProducts(arrayofProducts) {
  for (let p of arrayofProducts) {
    if (!products.includes(p)) {
      products.push(p);
    }
  }
}


function getProducts() {
  return products; // returnerer arrayet med alle produkter.
}



//TODO --------------------------------------------------------------------------------------------- Optimize

function searchDynamicObject(obj, arrSplit, count, soegevaerdi) {
  let found = false
  if ((obj[arrSplit[count]].toLocaleLowerCase()).includes(soegevaerdi1)) {
    return true;
  }
  else if (count == arrSplit.length - 1) {
    return false;
  }
  else {
    found = searchDynamicObject(obj[arrSplit[count]], arrSplit, count + 1, soegevaerdi);
  }
  return found;
}

async function searchDynamic(arr, attribut, soegevaerdi) {
  // let soegevaerdi1 = soegevaerdi;
  soegevaerdi.toLowerCase();
  let searchresults = [];
  let attributSplit = null;
  if(attribut == ""){
    attribut = "navn";
  }

  if (attribut.includes(".")) {
    attributSplit = attribut.split(".");
    for (let p of arr) {
      let found = searchDynamicObject(p, attributSplit, 0, soegevaerdi);
      if (found == true) {
        searchresults.push(p);
      }
    }
  }
  else {
    for (let p of arr) {
      try {
        let val = p[attribut].toLowerCase();
        if (val.includes(soegevaerdi)) {
          searchresults.push(p);
        }
      } catch (error) {
        console.log(error)
      }

    }
  };

//TODO maybe sort
return searchresults;
}



//TODO --------------------------------------------------------------------------------------------- Optimize

let pg = createProductgroup("hej", "hej");

let p1 = createProduct("Hat", 20, 10, 4567890, "Mowgli inc", 932005, pg);
let p2 = createProduct("Hat1", 20, 10, 4567890, "Mowgli inc", 932005, pg);
let p3 = createProduct("Hat2", 20, 10, 4567890, "Mowgli inc", 932005, pg);
let p4 = createProduct("1Hat", 20, 10, 4567890, "Mowgli inc", 932005, pg);
let p5 = createProduct("2Hat", 20, 10, 4567890, "Mowgli inc", 932005, pg);
let p6 = createProduct("1", 20, 10, 4567890, "Mowgli inc", 932005, pg);


console.log(searchDynamic(products, "navn", 1+""));


// finder en vare med det specifikke varenummer (skal indeholde 0'erne foran)
function getProduct(varenr) {
  let index = products.findIndex(object => {
    return object.varenr == varenr;
  });
  return products[index];
}



/*
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwMpbafG7AkNlU28omo8MDhA7ZgIh7BlA",
  authDomain: "papersign-19cd5.firebaseapp.com",
  projectId: "papersign-19cd5",
  storageBucket: "papersign-19cd5.appspot.com",
  messagingSenderId: "477663863462",
  appId: "1:477663863462:web:f765c4665f9f0610fd4a67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
*/

export default { Product, createProduct, getProduct, getProducts, getProductgroup, createProductgroup, removeAttribute, setNewAttribute, searchDynamic };


//TODO Firebase inplementation

function deleteProduct(product1) {
  let deletedd = false;
  try {
    // Remove Product from ProudctGroup
    let indexPG = product1.productgroup.products.indexOf(product1);
    product1.productgroup.products.splice(indexPG, 1);
    // Remove Product from Proudcts
    let indexP = getProducts.indexOf(product1);
    products.splice(indexP, 1);
    // Set ProudctGroup from Proudct to undefiend
    product1.productgroup = undefined;
    product1 = undefined;
    deletedd = true;
  } catch (error) {
    alert("Produkt blev ikke slettet. Fejl:" + error)
  }

  return deletedd;
}

function deleteProductGroup(productGroup1) {
  let deletedd = false;
  try {
    if (productGroup1.products.length < 1) {
      // Remove ProudctGroup from ProudctGroups
      let indexPG = getProductgroup.indexOf(productGroup1);
      getProductgroup.splice(indexPG, 1);
      // Set Proudcts from ProudctGroup to undefiend
      productGroup1 = undefined;
      deletedd = true;
    }
  } catch (error) {
    alert("Produkt blev ikke slettet. Fejl:" + error)
  }
  return deletedd;
}

function setProductGroup(productGroup, navn, beskrivelse) {
  let setd = false;
  try {
    // Set ProudctGroup from ProudctGroups
    productGroup.navn = navn;
    productGroup.beskrivelse = beskrivelse;
    setd = true;
  } catch (error) {
    alert("Produkt blev ikke ændret. Fejl:" + error)
  }
  return setd;
}

function setProduct(product, navn, pris, antal, EAN, leverandør, bestillingsnummer, produktgruppe) {
  let setd = false;
  try {
    // Set Product from ProudctGroup
    product.navn = navn;
    product.pris = pris;
    product.antal = antal;
    product.EAN = EAN;
    product.leverandør = leverandør;
    product.bestillingsnummer = bestillingsnummer;
    product.produktgruppe = produktgruppe;
    setd = true;
  } catch (error) {
    alert("Produkt blev ikke ændret. Fejl:" + error)
  }
  return setd;
}

let stop = 0;