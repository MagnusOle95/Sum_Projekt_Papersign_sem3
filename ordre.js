import logik from '../logik.js';

let ordrelinjenr = 1;
let fakturanr = 0;
let følgdeseddelnr = 0;

let fakturaer = [];
let følgesedler = [];

// faktura (ordre) indeholder flere ordrelinjer
class Faktura {
  constructor(navn) {
    this.dato = new Date();
    this.ordrelinjer = [];
    this.fakturanr = fakturanr;
    this.navn = navn;
    fakturanr++;
    fakturaer.push(this);
  }

  addOrdrelinje(produkt, antal) {
    // ordrelinje er de enkelte linker på en faktura
    class Ordrelinje {
      constructor(produkt, antal) {
        this.produkt = produkt;
        this.antal = antal;
        this.total = antal * produkt.pris;
        this.ordrelinjenr = ordrelinjenr;
        ordrelinjenr++;
      }
    }

    if (antal >= 1 && produkt instanceof logik.Product) {
      let ordrelinje = new Ordrelinje(produkt, antal);
      this.ordrelinjer.push(ordrelinje);
    }
  }
}

// følgeseddel indeholder flere fakturaer (det er dem, som skal sendes til økonomiafdelingen)
class Følgeseddel {
  constructor() {
    // navn på personen som skriver under
    this.dato = new Date();
    this.følgeseddelnr = følgeseddelnr;
    følgdeseddelnr++;
    this.fakturaer = [];
    følgesedler.push(this);
  }
  addFaktura(faktura) {
    fakturaer.push(faktura);
  }
  removeFaktura(faktura) {
    let index = fakturaer.indexOf(faktura);
    fakturaer.splice(index, 1);
  }
}

module.exports = {Faktura, Følgeseddel, fakturaer };
