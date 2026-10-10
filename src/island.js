import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// A single walkable island. Routes, camera and buildings share the same coordinates.
export function mountStudio(container, labels, projects, onSelect) {
  const scene = new T.Scene();
  scene.background = new T.Color('#c9e5e7');
  scene.fog = new T.Fog('#c9e5e7', 55, 115);
  const camera = new T.PerspectiveCamera(40, 1, .1, 180);
  const renderer = new T.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 8;
  controls.maxDistance = 65;
  controls.minPolarAngle = .25;
  controls.maxPolarAngle = 1.35;
  const skyLight = new T.HemisphereLight('#fff3d4', '#70929c', 2.3);
  const sun = new T.DirectionalLight('#ffe5b2', 3.3);
  sun.position.set(-18, 30, 15);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -28, right: 28, top: 28, bottom: -28, far: 90 });
  sun.shadow.normalBias = .045;
  scene.add(skyLight, sun);
  const island = new T.Group();
  scene.add(island);
  const materials = new Map();
  const material = color => {
    if (!materials.has(color)) materials.set(color, new T.MeshStandardMaterial({ color, roughness: .8 }));
    return materials.get(color);
  };
  const glowing = new T.MeshStandardMaterial({ color: '#ffe9ac', emissive: '#ffc26a', emissiveIntensity: .15 });
  const add = (group, geometry, color, x = 0, y = 0, z = 0) => {
    const obj = new T.Mesh(geometry, typeof color === 'string' ? material(color) : color);
    obj.position.set(x, y, z);
    obj.castShadow = true;
    obj.receiveShadow = true;
    group.add(obj);
    return obj;
  };
  const box = (g, w, h, d, x, y, z, c) => add(g, new T.BoxGeometry(w, h, d), c, x, y, z);
  const cylinder = (g, r, bottom, h, x, y, z, c, segments = 20) => add(g, new T.CylinderGeometry(r, bottom, h, segments), c, x, y, z);
  const sphere = (g, r, x, y, z, c, scale = [1, 1, 1]) => {
    const o = add(g, new T.SphereGeometry(r, 12, 8), c, x, y, z);
    o.scale.set(...scale);
    return o;
  };
  const cream = '#f4e3be', timber = '#715347', roofBlue = '#6687a4';
  const groundY = .44;
  let seed = 1423;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  // Smooth coastline with separate sand, soil and grass shelves.
  function coast(rx, rz) {
    const shape = new T.Shape();
    for (let i = 0; i <= 100; i++) {
      const a = i / 100 * Math.PI * 2;
      const r = 1 + .045 * Math.sin(a * 5) + .035 * Math.cos(a * 3);
      const x = Math.cos(a) * rx * r, z = Math.sin(a) * rz * r;
      if (i === 0) shape.moveTo(x, z); else shape.lineTo(x, z);
    }
    shape.closePath();
    return shape;
  }
  function shelf(rx, rz, height, y, color, bevel) {
    const geo = new T.ExtrudeGeometry(coast(rx, rz), { depth: height, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: bevel, bevelThickness: .15 });
    geo.rotateX(-Math.PI / 2);
    return add(island, geo, color, 0, y, 0);
  }
  shelf(20.8, 15.3, .5, -.8, '#bba47a', .45);
  shelf(20.1, 14.8, .28, -.33, '#efd79e', .3);
  shelf(18.6, 13.4, .3, -.14, '#94b783', .28);
  const oceanMaterial = new T.MeshStandardMaterial({ color: '#62bfc5', roughness: .35, metalness: .15 });
  const ocean = add(scene, new T.PlaneGeometry(300, 300), oceanMaterial, 0, -.65, 0);
  ocean.rotation.x = -Math.PI / 2;
  ocean.castShadow = false;
  for (let i = 0; i < 3; i++) {
    const line = new T.BufferGeometry().setFromPoints(coast(21.6 + i * 1.3, 16 + i).getPoints(120).map(p => new T.Vector3(p.x, -.57, p.y)));
    scene.add(new T.LineLoop(line, new T.LineBasicMaterial({ color: '#e4f7e9', transparent: true, opacity: .45 - i * .1 })));
  }
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2;
    sphere(island, .6 + random() * .55, Math.cos(a) * 19.2, -.15, Math.sin(a) * 13.9, '#a4aa8c', [1.3, .7, 1]);
  }

  const nodes = [
    [0, 9], [0, 5], [0, 1], [-4, 1], [-8, 1], [-11, 1], [-11, -4], [-11, -7],
    [4, 1], [8, 1], [11, 1], [11, -4], [11, -7], [6, 5], [9, 5], [9, 8],
    [-5, 5], [-8, 5], [-8, 8], [0, -4], [0, -7], [0, -10], [4, 9], [7, 10], [-4, 9],
  ];
  const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[2,8],[8,9],[9,10],[10,11],[11,12],[1,13],[13,14],[14,15],[1,16],[16,17],[17,18],[2,19],[19,20],[20,21],[0,22],[22,23],[0,24],[24,18]];
  function road(a, b) {
    const [x,z] = nodes[a], [xx,zz] = nodes[b];
    const length = Math.hypot(xx-x,zz-z);
    const tile = box(island, 1.5, .08, length + .5, (x+xx)/2, .35, (z+zz)/2, '#e3cc9c');
    tile.rotation.y = Math.atan2(xx-x,zz-z);
    for(let d = .4; d < length; d += .85) {
      const ratio = d / length;
      const stone = box(island, .54, .015, .4, x + (xx-x)*ratio, .4, z+(zz-z)*ratio, '#ebd9b2');
      stone.rotation.y = tile.rotation.y + (random()-.5)*.3;
    }
  }
  edges.forEach(([a,b]) => road(a,b));
  nodes.forEach(([x,z]) => cylinder(island, .78,.78,.08,x,.35,z,'#e3cc9c'));
  // Central wishing fountain and a small plaza.
  cylinder(island, 2.7,2.7,.08,0,.35,1,'#e3cc9c',40);
  cylinder(island,1,1.08,.38,-2.2,.46,-2,'#e7dfc9',32);
  cylinder(island,.83,.83,.03,-2.2,.67,-2,'#79c9cd',32);
  cylinder(island,.16,.22,.9,-2.2,1.1,-2,'#e7dfc9');
  cylinder(island,.47,.33,.16,-2.2,1.5,-2,'#e7dfc9');
  const fountain = sphere(island,.18,-2.2,1.8,-2,'#91e0dd');

  const colliders = [{x:-2.2,z:-2,r:1.2}];
  const places = [];
  function place(id, name, x, z, node, radius, height) {
    if (!projects.some(p => p.id === id)) return null;
    const group = new T.Group(); group.position.set(x,groundY,z);group.userData.project=id;island.add(group);
    const entry = { id,name,group,node,x,z,r:radius,anchor:new T.Vector3(x,height,z) };
    places.push(entry);colliders.push({x,z,r:radius});
    return group;
  }
  const roof = (g, w, d, h, y, color) => {
    const geo = new T.BufferGeometry();
    const pts = [-w/2,0,-d/2, w/2,0,-d/2,0,h,-d/2, -w/2,0,d/2,w/2,0,d/2,0,h,d/2];
    geo.setAttribute('position',new T.Float32BufferAttribute(pts,3));
    geo.setIndex([0,2,1,3,4,5,0,3,5,0,5,2,1,2,5,1,5,4,0,1,4,0,4,3]);geo.computeVertexNormals();
    add(g,geo,color,0,y,0);
    for (const side of [-1,1]) {
      for (let row=0;row<4;row++) {
        const q=(row+.5)/4;
        const tile=box(g,w/2+.05,.055,d+.08,side*w*q/4,y+h*(1-q),0,color);
        tile.rotation.z=side*-Math.atan2(h,w/2);
        // Tile strips sit on the slope and catch afternoon light.
        tile.scale.x=.27;
      }
    }
    cylinder(g,.09,.09,d+.2,0,y+h+.04,0,timber).rotation.x=Math.PI/2;
  };
  function addWindow(g,x,y,z) {
    box(g,.63,.76,.12,x,y,z,timber);box(g,.47,.59,.14,x,y,z+.04,glowing);
    box(g,.055,.62,.16,x,y,z+.12,cream);box(g,.49,.055,.16,x,y,z+.12,cream);
    box(g,.78,.12,.32,x,y-.43,z+.09,'#a68c68');
    for(let i=0;i<3;i++) sphere(g,.11,x-.25+i*.25,y-.39,z+.2,['#cb8395','#f0c96d','#c08dae'][i]);
  }
  function cottage(g,color=roofBlue,w=3.4,d=2.8) {
    if(!g)return;
    box(g,w+.3,.23,d+.3,0,.12,0,'#b8ae91');box(g,w,2.5,d,0,1.5,0,cream);
    roof(g,w+.65,d+.7,1.45,2.75,color);
    for(const x of [-w/2,w/2])box(g,.13,2.55,.14,x,1.5,d/2+.03,timber);
    box(g,w,.14,.14,0,2.62,d/2+.04,timber);
    box(g,.75,1.55,.13,0,1.03,d/2+.05,timber);
    sphere(g,.05,.23,1,d/2+.14,'#d9b66f');
    addWindow(g,-w*.32,1.65,d/2+.06);addWindow(g,w*.32,1.65,d/2+.06);
    addWindow(g,0,3.15,d/2+.4);
    box(g,.45,1,.5,w*.28,3.75,-.4,'#cda994');
    for(let i=0;i<3;i++)box(g,1.2,.1,1-i*.23,0,.06+i*.08,d/2+.45-i*.1,'#c9b894');
    for(const x of [-w*.6,w*.6]){
      cylinder(g,.35,.25,.43,x,.22,d*.55,'#b78168');sphere(g,.5,x,.63,d*.55,'#86a468',[1,.7,1]);
    }
  }
  const story=place('editorial','Story house',-8,10.3,18,1.85,5.5);cottage(story,'#bc6a78');
  const post=place('hanlin','Story post office',-8,2.9,17,1.65,5);cottage(post,'#719a83',2.9,2.4);
  if(post){box(post,.65,.7,.6,2.15,.9,1.15,'#628f79');box(post,.75,.12,.7,2.15,1.31,1.15,'#e6ce90');box(post,.38,.035,.07,2.15,1.02,1.48,timber);cylinder(post,.09,.09,.6,2.15,.35,1.15,timber);}
  const maker=place('app','Maker’s windmill',0,-12,21,1.6,6.3);cottage(maker,'#8b86af',2.9,2.5);
  const sails = new T.Group();
  if(maker){sails.position.set(0,3.15,1.85);maker.add(sails);cylinder(sails,.18,.18,.32,0,0,0,'#d9bf83').rotation.x=Math.PI/2;
    for(let i=0;i<4;i++){const arm=new T.Group();arm.rotation.z=i*Math.PI/2;sails.add(arm);box(arm,.13,2,.1,0,1,0,timber);box(arm,.45,1.2,.075,.14,1.3,.07,'#f3e7c6');for(let j=0;j<4;j++)box(arm,.48,.055,.08,.14,.8+j*.3,.12,timber);}}
  const tower=place('apac','Insight observatory',-13.5,-8,7,1.9,8);
  if(tower){cylinder(tower,1.2,1.65,.35,0,.18,0,'#aea18b');cylinder(tower,1.12,1.4,4.6,0,2.65,0,cream,32);
    cylinder(tower,1.7,1.7,.18,0,4.55,0,timber,32);cylinder(tower,1.15,1.15,1.1,0,5.18,0,'#94bcc2',24);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;cylinder(tower,.035,.035,.6,Math.cos(a)*1.57,4.95,Math.sin(a)*1.57,timber);}
    const rail=add(tower,new T.TorusGeometry(1.58,.035,5,36),timber,0,5.25,0);rail.rotation.x=Math.PI/2;
    const dome=sphere(tower,1.45,0,5.78,0,roofBlue,[1,.7,1]);cylinder(tower,.055,.09,.65,0,6.9,0,'#d9b66f');sphere(tower,.12,0,7.2,0,'#d9b66f');
    for(const y of [1.8,3.3])addWindow(tower,0,y,1.3);
    const scope=cylinder(tower,.22,.27,1.6,.8,5.75,1.15,'#d9b66f');scope.rotation.x=1;scope.rotation.z=-.5;
    box(tower,.8,1.55,.15,0,1,1.48,timber);
  }
  const camp=place('lulu','Sunday garden',11,-9.3,12,2,4.9);
  if(camp){cylinder(camp,2.3,2.3,.22,0,.12,0,'#c9b58e',32);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;cylinder(camp,.065,.09,2.8,Math.cos(a)*1.9,1.6,Math.sin(a)*1.9,cream);}
    cylinder(camp,0,2.65,1.5,0,3.75,0,'#bc6a78',32);sphere(camp,.13,0,4.55,0,'#dfbd74');
    for(let i=0;i<4;i++)box(camp,.6,.05,1.4,-1.2+i*.8,.28,.2,['#d5a5b9','#96b8ae','#d5be78','#97adc6'][i]);}
  const cinema=place('media','Woodland cinema',9,10.8,15,1.8,4.6);
  if(cinema){box(cinema,3.7,.23,2,0,.12,0,timber);box(cinema,3.6,2.35,.18,0,1.65,-.3,timber);box(cinema,3.25,1.94,.08,0,1.65,-.18,'#f4e6bf');
    roof(cinema,4.2,1.2,.5,2.88,'#628475');const play=add(cinema,new T.CircleGeometry(.35,3),'#bb6c7c',0,1.7,-.11);play.rotation.z=-Math.PI/2;
    for(let i=0;i<3;i++){box(cinema,2.8,.14,.5,0,.45,.8+i*.7,timber);for(const x of [-1,1])box(cinema,.12,.3,.45,x,.26,.8+i*.7,timber);}}
  const city=place('city','City memory harbour',13.6,1,10,1.9,5.7);
  cottage(city,roofBlue,3.3,2.7);
  if(city){for(let i=0;i<9;i++)box(city,2.5,.11,.34,3.1,.03,1+i*.35,'#bca079');for(const x of [2,4.2])for(const z of [1,3.8])cylinder(city,.075,.09,1,x,.35,z,timber);
    for(let i=0;i<4;i++){const h=.55+i*.23;box(city,.36,h,.35,-.7+i*.46,.4+h/2,2.1,['#79adac','#d2ba7a',roofBlue,'#c19cac'][i]);}}
  const film=place('moving-images','Atelier of moving images',5.4,11.4,23,1.3,4.7);cottage(film,'#b98869',2.5,2);
  if(film){const reel=add(film,new T.TorusGeometry(.38,.09,8,28),'#dec084',1.6,1.1,1);reel.rotation.x=Math.PI/2;cylinder(film,.055,.07,.9,1.6,.55,1,timber);}

  // The pond and hills are scenery; paths lead around them.
  const pond=cylinder(island,3.2,3.2,.04,5.6,.4,-3.8,'#74c4c3',48);pond.scale.z=.7;
  colliders.push({x:5.6,z:-3.8,r:2.6});
  for(let i=0;i<6;i++){const a=i*2.4;const pad=cylinder(island,.24,.24,.025,5.6+Math.cos(a)*2,.44,-3.8+Math.sin(a)*1.3,'#7f9e65');sphere(island,.09,pad.position.x,.5,pad.position.z,'#f2bdcf');}
  for(let i=0;i<5;i++){const x=-16+i*2,z=-11.5;const h=1.8+random()*1.5;sphere(island,2,x,.7,z,'#7ca582',[1.4,h/2,1.3]);colliders.push({x,z,r:2});}
  function tree(x,z,h) {
    const g=new T.Group();g.position.set(x,groundY,z);island.add(g);
    cylinder(g,.1,.22,h*.65,0,h*.32,0,timber,8);
    for(let i=0;i<3;i++)sphere(g,h*.27,(i-1)*h*.15,h*(.65+i*.08),(i%2)*.3,['#4d7860','#6e956d','#8eae78'][i],[1,1.15,1]);
    colliders.push({x,z,r:.6});
  }
  function distanceToPath(x,z) {
    return Math.min(...edges.map(([a,b]) => {
      const p=new T.Vector2(...nodes[a]),q=new T.Vector2(...nodes[b]),v=new T.Vector2(x,z);
      const delta=q.clone().sub(p);const t=T.MathUtils.clamp(v.clone().sub(p).dot(delta)/delta.lengthSq(),0,1);
      return v.distanceTo(p.addScaledVector(delta,t));
    }));
  }
  for(let i=0;i<100;i++){
    const x=(random()-.5)*36,z=(random()-.5)*24;
    if(x*x/18**2+z*z/12**2>1||distanceToPath(x,z)<1.6||colliders.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+1.7))continue;
    tree(x,z,2.1+random()*2.3);
  }
  // Batched flowers keep the garden lush without hundreds of draw calls.
  const blossoms=new T.InstancedMesh(new T.SphereGeometry(.075,6,4),material('#e6a5bd'),420);
  const stems=new T.InstancedMesh(new T.CylinderGeometry(.013,.017,.19,4),material('#64815a'),420);
  const dummy=new T.Object3D();let flowers=0;
  for(let i=0;i<650&&flowers<420;i++){
    const x=(random()-.5)*36,z=(random()-.5)*24;
    if(x*x/18**2+z*z/12**2>1||distanceToPath(x,z)<.95||places.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+.3)||Math.hypot(x-5.6,z+3.8)<3.4)continue;
    dummy.position.set(x,.45,z);dummy.scale.set(1,1,1);dummy.updateMatrix();stems.setMatrixAt(flowers,dummy.matrix);
    dummy.position.y=.59;dummy.scale.set(1.3,.7,1.3);dummy.updateMatrix();blossoms.setMatrixAt(flowers,dummy.matrix);
    blossoms.setColorAt(flowers,new T.Color(['#e9a5b9','#f4d486','#a4b8e1'][flowers%3]));flowers++;
  }
  blossoms.count=stems.count=flowers;island.add(blossoms,stems);
  const lamps=[];
  for(const node of [0,3,5,7,9,12,14,17,20,23]){
    const [x,z]=nodes[node];cylinder(island,.04,.075,1.65,x+1,.98,z,timber,8);box(island,.34,.46,.34,x+1,1.94,z,glowing);cylinder(island,0,.3,.25,x+1,2.28,z,roofBlue,4);
    const lamp=new T.PointLight('#ffd48d',0,4);lamp.position.set(x+1,1.9,z);island.add(lamp);lamps.push(lamp);
  }
  // Sailing boat, drifting cloud and small seabirds.
  const boat=new T.Group();boat.position.set(22,-.3,5);scene.add(boat);
  sphere(boat,1,0,0,0,'#b98265',[.6,.22,1.6]);cylinder(boat,.025,.025,2.3,0,1.1,0,cream);
  const sail=add(boat,new T.CircleGeometry(1,3),'#f7eaca',.34,1.3,0);sail.rotation.z=-.4;
  const clouds=[];
  for(let i=0;i<5;i++){const g=new T.Group();g.position.set(-30+i*13,14+random()*4,-22-random()*9);scene.add(g);for(let j=0;j<4;j++)sphere(g,1.5,j*1.4,Math.sin(j)*.4,0,'#f5f7e8',[1.5,.5,.75]);clouds.push(g);}
  const birds=[];
  for(let i=0;i<5;i++){const g=new T.Group();for(const s of [-1,1]){const wing=box(g,.5,.03,.15,s*.23,0,0,'#f7f5e6');wing.rotation.z=s*.3;}scene.add(g);birds.push(g);}
  const particlesGeometry=new T.BufferGeometry();const particlePositions=[];
  for(let i=0;i<60;i++)particlePositions.push((random()-.5)*32,.7+random()*2.3,(random()-.5)*22);
  particlesGeometry.setAttribute('position',new T.Float32BufferAttribute(particlePositions,3));
  const fireflies=new T.Points(particlesGeometry,new T.PointsMaterial({color:'#fbe78c',size:.12,transparent:true,opacity:.8}));fireflies.visible=false;scene.add(fireflies);

  // A little explorer, with separate legs for walking and a travel satchel.
  const avatar=new T.Group();avatar.position.set(0,groundY,9);island.add(avatar);
  const torso=box(avatar,.38,.5,.28,0,.64,0,'#7198b0');sphere(avatar,.21,0,1.06,0,'#edc7a4');
  cylinder(avatar,.3,.3,.05,0,1.25,0,'#e7c782');cylinder(avatar,.2,.23,.18,0,1.35,0,'#e7c782');
  for(const x of [-.075,.075])sphere(avatar,.025,x,1.08,.19,'#4e4543');
  const legs=[];for(const x of [-.11,.11]){const pivot=new T.Group();pivot.position.set(x,.4,0);avatar.add(pivot);box(pivot,.12,.32,.13,0,-.13,0,'#746363');box(pivot,.14,.1,.24,0,-.29,.04,timber);legs.push(pivot);}
  for(const x of [-.25,.25])sphere(avatar,.09,x,.63,0,'#edc7a4',[.7,1.7,.8]);box(avatar,.29,.35,.16,0,.7,-.22,'#c18e60');
  const beacon=cylinder(island,.24,.24,.018,0,.43,9,'#faf0b7');beacon.visible=false;
  let route=[],mode='overview',night=false,nearest=null,hover=null,visited=new Set(),lastTime=0;
  const keys=new Set();
  const ui=document.createElement('div');ui.className='island-hud';
  ui.innerHTML=`<div class="island-toolbar"><button data-island-mode="walk">Start exploring</button><button data-island-mode="overview" aria-pressed="true">Island view</button><button data-island-time aria-pressed="false">☀ Afternoon</button><button data-island-full>⛶ Expand</button></div><div class="island-arrival" aria-live="polite"><span>A little adventure awaits</span><b>Welcome to Story Island</b><p>Click a path to walk. Visit a building to discover a project.</p><button data-island-open hidden>Open project ↗</button></div><div class="island-footnote"><span data-island-progress>0 / ${places.length} places discovered</span><span data-island-help>Drag to orbit · Scroll to zoom</span></div><div class="island-pad" aria-label="Walking controls" hidden><button data-move="w" aria-label="Walk forward">↑</button><div><button data-move="a" aria-label="Walk left">←</button><button data-move="s" aria-label="Walk backward">↓</button><button data-move="d" aria-label="Walk right">→</button></div></div>`;
  container.parentElement.appendChild(ui);
  const destinationSelect=document.createElement('select');destinationSelect.setAttribute('aria-label','Choose an island destination');
  destinationSelect.innerHTML='<option value="">Where shall we go?</option>'+places.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  ui.querySelector('.island-toolbar').insertBefore(destinationSelect,ui.querySelector('[data-island-time]'));
  destinationSelect.onchange=()=>{const p=places.find(p=>p.id===destinationSelect.value);if(p)visit(p);destinationSelect.value='';};
  const soundButton=document.createElement('button');soundButton.textContent='♫ Sound off';soundButton.setAttribute('aria-pressed','false');ui.querySelector('.island-toolbar').insertBefore(soundButton,ui.querySelector('[data-island-full]'));
  let audioContext=null,soundGain=null,soundOn=false;
  soundButton.onclick=async()=>{
    try{
      if(!audioContext){
        audioContext=new AudioContext();soundGain=audioContext.createGain();soundGain.gain.value=0;soundGain.connect(audioContext.destination);
        const buffer=audioContext.createBuffer(1,audioContext.sampleRate*4,audioContext.sampleRate),data=buffer.getChannelData(0);
        let noise=0;for(let i=0;i<data.length;i++){noise=(noise+Math.random()*.04-.02)/1.02;data[i]=noise;}
        const surf=audioContext.createBufferSource();surf.buffer=buffer;surf.loop=true;
        const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=650;surf.connect(filter);filter.connect(soundGain);surf.start();
      }
      await audioContext.resume();soundOn=!soundOn;soundGain.gain.setTargetAtTime(soundOn?.24:0,audioContext.currentTime,.5);soundButton.textContent=soundOn?'♫ Sound on':'♫ Sound off';soundButton.setAttribute('aria-pressed',String(soundOn));
    }catch{soundButton.textContent='Sound unavailable';soundButton.disabled=true;}
  };
  const arrival=ui.querySelector('.island-arrival'),open=ui.querySelector('[data-island-open]');
  const allProjects=Object.fromEntries(projects.map(p=>[p.id,p]));
  for(const p of places){
    const button=document.createElement('button');button.className='hotspot island-label';button.dataset.islandPlace=p.id;
    button.innerHTML=`<span style="background:${allProjects[p.id].color}"></span><b>${p.name}</b>`;
    button.setAttribute('aria-label',`Visit ${p.name}: ${allProjects[p.id].name}`);labels.appendChild(button);p.label=button;
    button.addEventListener('click',()=>visit(p));button.addEventListener('mouseenter',()=>hover=p);button.addEventListener('mouseleave',()=>hover=null);
  }
  function reset(){route=[];mode='overview';controls.enabled=true;controls.target.set(0,1,0);camera.position.set(34,31,42);controls.update();syncMode();}
  function syncMode(){ui.querySelector('[data-island-mode="walk"]').setAttribute('aria-pressed',String(mode==='walk'));ui.querySelector('[data-island-mode="overview"]').setAttribute('aria-pressed',String(mode==='overview'));ui.querySelector('.island-pad').hidden=mode!=='walk';ui.querySelector('[data-island-help]').textContent=mode==='walk'?'Click paths · WASD / arrows to walk · E to enter':'Drag to orbit · Scroll to zoom';container.parentElement.dataset.exploreMode=mode;}
  function walking(){if(mode==='walk')return;mode='walk';controls.enabled=true;controls.target.copy(avatar.position).add(new T.Vector3(0,.8,0));camera.position.copy(avatar.position).add(new T.Vector3(5,5.5,7));controls.update();syncMode();}
  function nearestNode(x,z){let best=0,d=Infinity;nodes.forEach(([xx,zz],i)=>{const v=Math.hypot(xx-x,zz-z);if(v<d){d=v;best=i;}});return best;}
  function pathTo(goal){
    // Grid navigation also finds a way back to a path after free keyboard exploration.
    const cells=new Map();
    for(let x=-36;x<=36;x++)for(let z=-25;z<=25;z++)if(canWalk(x*.5,z*.5))cells.set(`${x},${z}`,{x,z,cost:1+Math.min(distanceToPath(x*.5,z*.5),3)*2});
    const closest=(x,z)=>{let best=null,d=Infinity;for(const [key,c]of cells){const next=Math.hypot(c.x*.5-x,c.z*.5-z);if(next<d){d=next;best=key;}}return best;};
    const start=closest(avatar.position.x,avatar.position.z),finish=closest(...nodes[goal]);
    const scores=new Map([[start,0]]),prev=new Map(),pending=new Set([start]);
    const end=cells.get(finish),heuristic=c=>Math.hypot(c.x-end.x,c.z-end.z)*.5;
    while(pending.size){
      let current=null,best=Infinity;for(const key of pending){const score=scores.get(key)+heuristic(cells.get(key));if(score<best){best=score;current=key;}}
      if(current===finish)break;pending.delete(current);const c=cells.get(current);
      for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
        const key=`${c.x+dx},${c.z+dz}`,next=cells.get(key);if(!next||!canWalk((c.x+dx*.5)*.5,(c.z+dz*.5)*.5))continue;
        const score=scores.get(current)+Math.hypot(dx,dz)*.5*next.cost;
        if(score<(scores.get(key)??Infinity)){scores.set(key,score);prev.set(key,current);pending.add(key);}
      }
    }
    if(!scores.has(finish)){arrival.querySelector('p').textContent='Choose another path or use the arrow keys to move around the garden.';return;}
    const path=[];for(let key=finish;key;key=prev.get(key)){const c=cells.get(key);path.unshift(new T.Vector3(c.x*.5,groundY,c.z*.5));}
    route=path;beacon.position.set(nodes[goal][0],.43,nodes[goal][1]);beacon.visible=true;
  }
  function visit(p){walking();pathTo(p.node);arrival.querySelector('span').textContent='Follow the little path';arrival.querySelector('b').textContent=p.name;arrival.querySelector('p').textContent=`Walking to ${allProjects[p.id].name}.`;}
  ui.querySelector('[data-island-mode="walk"]').onclick=walking;ui.querySelector('[data-island-mode="overview"]').onclick=reset;
  ui.querySelector('[data-island-time]').onclick=()=>{
    night=!night;scene.background.set(night?'#405a7a':'#c9e5e7');scene.fog.color.copy(scene.background);sun.intensity=night?.65:3.3;sun.color.set(night?'#b6c7fb':'#ffe5b2');skyLight.intensity=night?1:2.3;glowing.emissiveIntensity=night?1.6:.15;lamps.forEach(l=>l.intensity=night?3:0);fireflies.visible=night;ui.querySelector('[data-island-time]').textContent=night?'☾ Twilight':'☀ Afternoon';ui.querySelector('[data-island-time]').setAttribute('aria-pressed',String(night));
  };
  const expanded=()=>container.parentElement.classList.contains('island-expanded');
  ui.querySelector('[data-island-full]').onclick=()=>{const next=!expanded();container.parentElement.classList.toggle('island-expanded',next);document.body.classList.toggle('island-expanded-body',next);ui.querySelector('[data-island-full]').textContent=next?'↙ Exit expanded view':'⛶ Expand';resize();};
  open.onclick=()=>{if(nearest)onSelect(nearest.id);};
  function keyDown(e){if(document.querySelector('dialog[open]')||container.parentElement.hidden)return;if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;const key=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)&&mode==='walk'){e.preventDefault();keys.add(key);route=[];}if(key==='e'&&nearest&&mode==='walk')onSelect(nearest.id);if(key==='escape'&&expanded())ui.querySelector('[data-island-full]').click();}
  const keyUp=e=>keys.delete(e.key.toLowerCase()),clearKeys=()=>keys.clear();
  window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',clearKeys);
  ui.querySelectorAll('[data-move]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);walking();route=[];keys.add(b.dataset.move);};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.move);});
  const ray=new T.Raycaster(),pointer=new T.Vector2();let down=null;
  function cast(e){const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(island.children,true);}
  renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
  renderer.domElement.addEventListener('pointerup',e=>{
    if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6){down=null;return;}down=null;
    const hits=cast(e);let obj=hits[0]?.object;while(obj&&!obj.userData.project)obj=obj.parent;
    if(obj){const p=places.find(p=>p.id===obj.userData.project);if(p)visit(p);return;}
    if(!hits.length)return;const point=hits[0].point;walking();pathTo(nearestNode(point.x,point.z));
  });
  renderer.domElement.addEventListener('pointermove',e=>{let obj=cast(e)[0]?.object;while(obj&&!obj.userData.project)obj=obj.parent;hover=obj?places.find(p=>p.id===obj.userData.project):null;renderer.domElement.style.cursor=hover?'pointer':mode==='walk'?'crosshair':'grab';});
  function canWalk(x,z){return x*x/18.3**2+z*z/12.8**2<1&&!colliders.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+.22);}
  function move(delta){const next=avatar.position.clone().add(delta);if(canWalk(next.x,next.z))avatar.position.copy(next);else if(canWalk(next.x,avatar.position.z))avatar.position.x=next.x;else if(canWalk(avatar.position.x,next.z))avatar.position.z=next.z;avatar.rotation.y=Math.atan2(delta.x,delta.z);}
  function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.fov=w<650?55:40;camera.updateProjectionMatrix();renderer.setSize(w,h);}
  const observer=new ResizeObserver(resize);observer.observe(container);reset();resize();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),projected=new T.Vector3(),oldPosition=new T.Vector3();
  let frame,lastChirp=0;
  function tick(time){
    frame=requestAnimationFrame(tick);const dt=Math.min((time-lastTime)/1000,.04);lastTime=time;
    if(!container.clientWidth||document.hidden){keys.clear();return;}
    const paused=!!document.querySelector('dialog[open]');oldPosition.copy(avatar.position);
    let moving=false;
    if(mode==='walk'&&!paused){
      const dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
      const dz=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
      if(dx||dz){const forward=controls.target.clone().sub(camera.position);forward.y=0;forward.normalize();const right=new T.Vector3().crossVectors(forward,new T.Vector3(0,1,0));move(right.multiplyScalar(dx).addScaledVector(forward,-dz).normalize().multiplyScalar(dt*3.5));moving=true;}
      else if(route.length){const delta=route[0].clone().sub(avatar.position);delta.y=0;if(delta.length()<.18){route.shift();if(!route.length)beacon.visible=false;}else{move(delta.normalize().multiplyScalar(dt*3.2));moving=true;}}
      const delta=avatar.position.clone().sub(oldPosition);camera.position.add(delta);controls.target.copy(avatar.position).add(new T.Vector3(0,.8,0));
    }
    legs.forEach((leg,i)=>leg.rotation.x=moving?Math.sin(time*.011+i*Math.PI)*.55:0);
    const near=places.find(p=>Math.hypot(avatar.position.x-nodes[p.node][0],avatar.position.z-nodes[p.node][1])<1.4);
    if(near!==nearest){nearest=near||null;open.hidden=!nearest;if(nearest){visited.add(nearest.id);arrival.querySelector('span').textContent='You have arrived';arrival.querySelector('b').textContent=nearest.name;arrival.querySelector('p').textContent=allProjects[nearest.id].intro;ui.querySelector('[data-island-progress]').textContent=`${visited.size} / ${places.length} places discovered`;open.textContent=`Open ${allProjects[nearest.id].name} ↗`;}}
    controls.update();
    for(const p of places){projected.copy(p.anchor).project(camera);p.label.hidden=projected.z>1||projected.z< -1||Math.abs(projected.x)>.96||Math.abs(projected.y)>.9||(mode==='walk'&&hover!==p&&Math.hypot(avatar.position.x-p.x,avatar.position.z-p.z)>7);p.label.style.left=`${(projected.x*.5+.5)*container.clientWidth}px`;p.label.style.top=`${(-projected.y*.5+.5)*container.clientHeight}px`;p.label.classList.toggle('is-hovered',hover===p);p.label.classList.toggle('is-discovered',visited.has(p.id));}
    if(!reduced.matches){sails.rotation.z=time*.00012;boat.position.y=-.3+Math.sin(time*.001)*.07;fountain.position.y=1.8+Math.sin(time*.003)*.06;clouds.forEach((c,i)=>c.position.x=-30+i*13+Math.sin(time*.000035+i)*2);birds.forEach((b,i)=>b.position.set(Math.cos(time*.00018+i)*21,7+i*.25+Math.sin(time*.002+i)*.15,Math.sin(time*.00018+i)*13));fireflies.rotation.y=Math.sin(time*.0001)*.04;}
    if(soundOn&&time-lastChirp>8000&&!paused){lastChirp=time;const chirp=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;chirp.frequency.setValueAtTime(night?1200:2300,now);chirp.frequency.exponentialRampToValueAtTime(night?900:3300,now+.14);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.09,now+.04);gain.gain.exponentialRampToValueAtTime(.001,now+.3);chirp.connect(gain);gain.connect(soundGain);chirp.start();chirp.stop(now+.32);chirp.onended=()=>{gain.disconnect();chirp.disconnect();};}
    renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(tick);
  return {
    resize,reset,
    setWorld(name){const p=places.find(p=>p.id===({forest:'editorial',pond:'city',library:'apac'}[name]));if(p)visit(p);},
    zoomBy(factor){const distance=camera.position.distanceTo(controls.target);const next=T.MathUtils.clamp(distance/factor,8,65);camera.position.sub(controls.target).multiplyScalar(next/distance).add(controls.target);controls.update();},
    dispose(){cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);window.removeEventListener('blur',clearKeys);audioContext?.close();controls.dispose();renderer.dispose();ui.remove();},
  };
}
