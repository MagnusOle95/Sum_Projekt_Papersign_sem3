import { jsPDF } from "jspdf";
let count =0;
var signaturePad
var canvas;
function setupSigBox(){
 canvas = document.querySelector("canvas");

 signaturePad = new SignaturePad(canvas);
}
document.addEventListener("DOMContentLoaded",setupSigBox);

function clearSig(){
   signaturePad.clear()
}
document.getElementById("sletSig").addEventListener("click",clearSig)
// gem funktion skal håndteres af express før den virker rigtig 
function gemSig(navn){
   var imageData= signaturePad.toDataURL();
   var doc = new jsPDF()
   doc.setFontSize(40)
   doc.text(35,25,"Underskrift: "+navn)
   doc.addImage(imageData,"JPEG",15,40,180,180)
}

document.getElementById("gemSig").addEventListener("click",gemSig)


