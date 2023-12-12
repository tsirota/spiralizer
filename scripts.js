"use strict";

//encapsulating the program to preserve the global namespace
(function () {

  //reset the form when page is reloaded
  document.getElementById("myForm").reset() 

  //setting event listeners
  document.getElementById("draw").onclick = function() {stopAnimation=false;}; // capturing draw button click
  document.getElementById("myForm").onsubmit = function() {drawSpiral();return false;}; //on sumbit, draw the spiralized image
  document.getElementById("clearI").onclick = function() {stopAnimation=true;clear2();}; //capturing clear button on click
  document.getElementById("saveD").onclick = function() {saveDrawing();}; // capturing save drawing button on click
  document.getElementById("radius").onchange = function(){rScaler=this.value;document.getElementById("cRadius").innerHTML=document.getElementById("radius").value;};  // updating the radius based on the user input
  document.getElementById("thickness").onchange = function(){tScaler=this.value;document.getElementById("cThickness").innerHTML=document.getElementById("thickness").value;};  // updating the thickness based on user input
  document.getElementById("lineColor").onchange = function(){drawColor=this.value;document.getElementById("cColor").innerHTML=document.getElementById("lineColor").value;}; // updating the line color based on user input

  var imageLoader = document.getElementById("imageLoader"); // capturing the image upload event
  imageLoader.onchange = bImageLoad; // uploading the image on upload event

  // setting global application variables
  var canvas1 = document.getElementById("myCanvas1"); // storing the canvas1 element in a variable
  var ctx1 = canvas1.getContext("2d"); // storing canvas1 context in a variable

  var canvas2 = document.getElementById("myCanvas2"); // storing the canvas2 element in a variable
  var ctx2 = canvas2.getContext("2d"); // storing canvas2 context in a variable

  var stopAnimation=false; //stop animation flag
  var cSeg = 0; // the current line segment being drawn.
  var thickness = 0; // the added thickess to the line segment
  var x = 0; //line starting x-position
  var y = 0; //line starting y-position
  var a1 = 2.5; //initial condition #1 for spiral
  var a2 = 2.5;  //initial condition #2 for spiral

  var uCounter = 0; //count the number of uploads

  // assigning user input values to variables
  var drawColor = document.getElementById("lineColor").value ; //this value is modified by user selected color
  var tScaler = document.getElementById("radius").value ; //line thickness scaler
  var rScaler = document.getElementById("thickness").value ; //radius diameter scaler
  var drawSpeed = 1; //animation delay modifier for debugging and easter egg for people who want another setting to play with

  //the following function runs when a new image is uploaded
  function bImageLoad(evt) {

    ctx1.clearRect(0, 0, canvas1.width, canvas1.height); //clear the animated canvas before loading 
    clear2(); //reset some initial conditions 

  //the following function scales the uploaded image and draws it to canvas1
    var reader = new FileReader();
    reader.onload = function (event) { //reads image data on file upload
      var img = new Image(); //initializing a new image object
      img.onload = function () {  //runs once image is uploaded to the canvas
        var hRat = canvas1.width / img.width; //getting the horizontal image scale factor
        var vRat = canvas1.height / img.height; //getting the vertical image scale factor
        var ratio  = Math.min ( hRat, vRat ); //determining if limiting scale is width or height

        ctx1.drawImage(img, 0, 0, img.width*ratio, img.height*ratio); //scaling the uploaded image to fit canvas1

      };
      img.src = event.target.result; //Setting the source of the image to the uploaded file data
    };
    reader.readAsDataURL(evt.target.files[0]);//reading the image data back into the canvas

    if(uCounter!=0 && x!=0){
      document.getElementById("imageLoader").setAttribute("disabled", ""); //disable image upload button while animation is processing
    }

    uCounter++; //itterating the upload counter
    stopAnimation=false; //setting stop animation to false
    document.getElementById("errorM1").setAttribute("hidden",true) //hiding the error message if it's visible
  }

  //the following function returns the rgba summation of any pixel in canvas 1
  function getPixelColor(x, y) {
    var imageData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height); //reading the pixel data of the image in cavas 1
    var index = (y * imageData.width + x) * 4; //storing the rgba pixel value in index
    return imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2] + imageData.data[index + 3]; //summing the rgba values and returning the value.
  }

  //this function draws a sprialized version of the image uploaded to canvas 1 to canvas 2
  function drawSpiral() {

    if(uCounter==0)
    {
      stopAnimation = true;
      document.getElementById("errorM1").removeAttribute("hidden");
    }

    //only run when animation flag is false and x co-ordinate is out of bounds
    else if (x<240 && stopAnimation ==false) {

      document.getElementById("radius").setAttribute("disabled", ""); // disable radius slider
      document.getElementById("thickness").setAttribute("disabled", ""); // disable thickness slider
      document.getElementById("lineColor").setAttribute("disabled", ""); // disable color picker

      //using the "spiral of theodorus" algorithm to draw a spiral with equali-distant points
      var n = cSeg + 2/rScaler; //arc length. Drives the radius of the arc.
      x = a1 - a2 / (Math.sqrt(n)); // x componenet of spiral
      y = a2 + a1 / (Math.sqrt(n)); // y componenet of spiral

      // getting the pixel color value
      var pColor=getPixelColor(Math.round(x + canvas2.width / 2),Math.round(y + canvas2.height / 2));

      // modifying the line thickness based on the grayscale value of the nearest pixel
      if (pColor <= 1020 && pColor > 714 ) 
      {
        thickness = 0;
      } 
      else if (pColor <= 714 && pColor > 561) 
      {
        thickness = 1 * tScaler;
      }

      else if (pColor <= 561 && pColor > 408) 
      {
        thickness = 2 * tScaler;
      }

      else if (pColor <= 408 && pColor > 255) 
      {
        thickness = 3 * tScaler;
      }

      else if (pColor <= 255) 
      {
        thickness = 4 * tScaler;
      }
      else
      {
        thickness = 0;
      }

      // drawing circles at begining of each line to smooth out the thickness transition 
      ctx2.beginPath();
      ctx2.arc(a1 + canvas2.width / 2,a2 + canvas2.height / 2,(thickness/2),0,2 * Math.PI);
      ctx2.fillStyle = drawColor; 
      ctx2.fill();

      // drawing the line spiral and modifying the thickness as it's drawn
      ctx2.lineWidth = 1+thickness;
      ctx2.strokeStyle = drawColor; 
      ctx2.beginPath();
      ctx2.moveTo(a1+ canvas2.width/2, a2+ canvas2.height / 2);
      ctx2.lineTo(x + canvas2.width / 2,y + canvas2.height / 2);
      ctx2.stroke();

      // drawing circles at end of each line to smooth out the thickness transition 
      ctx2.beginPath();
      ctx2.arc(x + canvas2.width / 2,y + canvas2.height / 2,(thickness/2),0,2 * Math.PI);
      ctx2.fillStyle = drawColor; 
      ctx2.fill();

      //setting the old end points to new origin
      a1 = x;
      a2 = y;

      //itterating the current segment being drawn
      cSeg++;

      document.getElementById("imageLoader").setAttribute("disabled", ""); //disable image upload button while animation is processing

      setTimeout(drawSpiral, 1*drawSpeed); // animating the segment drawing
    }
    else{
      document.getElementById("imageLoader").removeAttribute("disabled"); //enabling the image upload button after animation is finished or halted
      document.getElementById("radius").removeAttribute("disabled"); // enable radius slider
      document.getElementById("thickness").removeAttribute("disabled"); // enable thickness slider
      document.getElementById("lineColor").removeAttribute("disabled"); // enable color picker
    }
  }

  //this function clears canvas2 so that it can be redrawn 
  function clear2(){
    //stopAnimation=true;
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height); //clear the animated canvas before loading 
    cSeg=0; //reset current line segment to zero position
    a1 = 2.5; // reset initial condition for the spiral
    a2 = 2.5; // reset initial condition for the spiral
    x = 0; //stop animation
    y = 0; // reset initial condition for the spiral
    document.getElementById("imageLoader").removeAttribute("disabled"); //enable upload button after image is cleared


  }

  // Constructor function for creating the savedSetting object
  function savedSetting(pName,pColor, pRadius, pThickness) {
    this.name = pName;
    this.color = pColor;
    this.radius = pRadius;
    this.thickness = pThickness;
  }

  //this function saves the output of canvas2 the DOM 
  function saveDrawing() {
    if(isCanvas2Blank()==false){

      var dName = document.getElementById("imageLoader").value.split("\\"); //obtaining an array containing the uploaded image's name

      //creating a new savedSetting objet 
      const setting = new savedSetting(
        dName[dName.length-1],
        document.getElementById("lineColor").value,
        document.getElementById("radius").value,
        document.getElementById("thickness").value
      );


      const newCanvas = document.createElement("canvas");  // creating a new canvas element
      newCanvas.width = 500; // setting the width
      newCanvas.height = 500; // setting the height
      const newCtx = newCanvas.getContext("2d"); //getting the context

      newCtx.drawImage(canvas2, 0, 0); // drawing the content of Canvas2 onto the new canvas

      const listItem = document.createElement("tr");   // creating a new table row
      const tableData = document.createElement("td");   // creating a new table data cell
      tableData.colSpan = 3; //setting the collumn span

      tableData.appendChild(newCanvas);   // appending the new canvas to the table data cell

      const settingsDiv = document.createElement("div");   // creating a div to display the settings
      settingsDiv.textContent = `Name: ${setting.name}, Color: ${setting.color}, Radius: ${setting.radius}, Thickness: ${setting.thickness}`; //populating div with saved setting

      tableData.appendChild(settingsDiv); // appending the settings div to the table data cell

      // creating a delete button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = function () {
          // removing the parent table row when the delete button is clicked
          listItem.remove();
      };

      tableData.appendChild(deleteButton); // appending the delete button to the table data cell

      listItem.appendChild(tableData);  // appending the table data cell to the table row

      document.getElementById("savedItems").appendChild(listItem);  // appending the new list item to the end of the savedItems list
    }
  }

  //this function checks if canvas2 is blank or not
  function isCanvas2Blank() {
    var imageData = ctx2.getImageData(0, 0, canvas2.width, canvas2.height); //loading in canvas 2
    var data = imageData.data; //getting the canvas 2 data array
    for (var i = 0; i < data.length; i += 4) {  //checking each pixel
      if (data[i + 3] !== 0) {
        return false; //if any pixel has data return false
      }
    }
    return true; //if no pixels have data then return true
  }

})(); 

