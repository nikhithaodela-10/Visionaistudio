const imageInput=document.getElementById("imageInput");
const uploadTab=document.getElementById("uploadTab"), cameraTab=document.getElementById("cameraTab");
const uploadPanel=document.getElementById("uploadPanel"), cameraPanel=document.getElementById("cameraPanel");
const resultSection=document.getElementById("resultSection"), imageCanvas=document.getElementById("imageCanvas");
const ctx=imageCanvas.getContext("2d"), detections=document.getElementById("detections"), status=document.getElementById("status");
const clearBtn=document.getElementById("clearBtn"), video=document.getElementById("video"), cameraCanvas=document.getElementById("cameraCanvas");
let model=null, stream=null, cameraRunning=false;

async function loadModel(){
  status.textContent="Loading AI model...";
  try{model=await cocoSsd.load(); status.textContent="AI model ready";}catch(e){status.textContent="Could not load AI model";}
}
loadModel();

uploadTab.onclick=()=>{uploadTab.classList.add("active");cameraTab.classList.remove("active");uploadPanel.classList.remove("hidden");cameraPanel.classList.add("hidden");stopCamera()};
cameraTab.onclick=()=>{cameraTab.classList.add("active");uploadTab.classList.remove("active");uploadPanel.classList.add("hidden");cameraPanel.classList.remove("hidden")};

imageInput.onchange=async e=>{
  const file=e.target.files[0]; if(!file)return;
  const img=new Image(); img.onload=async()=>{
    resultSection.classList.remove("hidden");
    imageCanvas.width=img.naturalWidth; imageCanvas.height=img.naturalHeight;
    ctx.drawImage(img,0,0); await detect(img);
    URL.revokeObjectURL(img.src);
  }; img.src=URL.createObjectURL(file);
};

async function detect(source){
  if(!model){status.textContent="AI model is still loading...";return}
  status.textContent="Analyzing...";
  const preds=await model.detect(source);
  drawDetections(preds,imageCanvas,ctx);
  showList(preds);
  status.textContent=`${preds.length} object${preds.length===1?"":"s"} detected`;
}
function drawDetections(preds,canvas,c){
  c.clearRect(0,0,canvas.width,canvas.height);
  if(canvas===imageCanvas){ /* image is redrawn by caller before detection */ }
  c.lineWidth=Math.max(2,canvas.width/400); c.font=`${Math.max(14,canvas.width/55)}px Arial`;
  preds.forEach(p=>{
    const [x,y,w,h]=p.bbox;c.strokeStyle="#63d9c0";c.fillStyle="#63d9c0";c.strokeRect(x,y,w,h);
    const label=`${p.class} ${(p.score*100).toFixed(0)}%`; const tw=c.measureText(label).width+12;
    c.fillRect(x,Math.max(0,y-25),tw,25);c.fillStyle="#06131d";c.fillText(label,x+6,Math.max(18,y-7));
  });
}
function showList(preds){
  detections.innerHTML=preds.length?preds.map(p=>`<div class="detection"><span>${p.class}</span><small>${(p.score*100).toFixed(1)}%</small></div>`).join(""):"<p style='color:#8095ad'>No objects detected.</p>";
}
clearBtn.onclick=()=>{resultSection.classList.add("hidden");imageInput.value="";detections.innerHTML=""};

document.getElementById("startCamera").onclick=async()=>{
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});video.srcObject=stream;
    cameraRunning=true;document.getElementById("cameraPlaceholder").style.display="none";requestAnimationFrame(cameraLoop);
  }catch(e){document.getElementById("cameraPlaceholder").textContent="Camera permission was denied or is unavailable."}
};
document.getElementById("stopCamera").onclick=stopCamera;
function stopCamera(){cameraRunning=false;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}video.srcObject=null}
async function cameraLoop(){
  if(!cameraRunning)return;
  if(video.readyState>=2&&model){
    cameraCanvas.width=video.videoWidth;cameraCanvas.height=video.videoHeight;
    const c=cameraCanvas.getContext("2d");c.drawImage(video,0,0);
    const preds=await model.detect(video);c.drawImage(video,0,0);drawDetections(preds,cameraCanvas,c);showList(preds);
    resultSection.classList.remove("hidden");status.textContent=`Live: ${preds.length} object${preds.length===1?"":"s"} detected`;
  }
  requestAnimationFrame(cameraLoop);
}