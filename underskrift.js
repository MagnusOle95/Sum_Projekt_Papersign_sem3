
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
function gemSig(){
   var imageData= signaturePad.toDataURL();
   console.log(imageData)
}

document.getElementById("gemSig").addEventListener("click",gemSig)