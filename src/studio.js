import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function mountStudio(container,labels,projects,onSelect){
 const scene=new T.Scene();const camera=new T.PerspectiveCamera(32,1,.1,100);camera.position.set(11,10,13);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;container.appendChild(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableZoom=false;controls.enablePan=false;controls.minPolarAngle=.55;controls.maxPolarAngle=1.22;controls.minAzimuthAngle=-.1;controls.maxAzimuthAngle=1.18;controls.target.set(0,1.4,0);controls.enableDamping=true;
 scene.add(new T.HemisphereLight(0xfff3ce,0x466b4d,2));const sun=new T.DirectionalLight(0xffdca3,3.5);sun.position.set(-4,10,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9});sun.shadow.bias=-.0005;sun.shadow.normalBias=.025;scene.add(sun);
 const root=new T.Group();scene.add(root);const targets=[];let selected=null;
 const mat=(c,roughness=.65)=>new T.MeshStandardMaterial({color:c,roughness});const colors={wood:mat('#b18c66'),edge:mat('#84674e'),blue:mat('#6b85a4'),metal:mat('#d8dadd',.35),ink:mat('#323c4c'),paper:mat('#f8f5e9'),leaf:mat('#507361'),red:mat('#bf3658'),wall:mat('#c4d0dd')};
 function box(parent,w,h,d,x,y,z,m){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function cylinder(parent,r1,r2,h,x,y,z,m){const mesh=new T.Mesh(new T.CylinderGeometry(r1,r2,h,32),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function ball(parent,r,x,y,z,m,s=[1,1,1]){const mesh=new T.Mesh(new T.SphereGeometry(r,24,16),m);mesh.position.set(x,y,z);mesh.scale.set(...s);mesh.castShadow=true;parent.add(mesh);return mesh;}
 function texture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:t});}
 function plane(parent,w,h,x,y,z,m,rx=0){const mesh=new T.Mesh(new T.PlaneGeometry(w,h),m);mesh.position.set(x,y,z);mesh.rotation.x=rx;parent.add(mesh);return mesh;}
 function object(id,x,y,z,anchor){const group=new T.Group();group.position.set(x,y,z);group.userData.project=id;root.add(group);targets.push({id,group,anchor:new T.Vector3(...anchor),base:y});return group;}

 // A mossy storybook island with a woodland writing nook.
 const soil=cylinder(root,4.8,4.3,.65,0,-.4,0,mat('#786346'));soil.scale.z=.78;
 const moss=cylinder(root,4.85,4.8,.2,0,-.03,0,mat('#78945c'));moss.scale.z=.78;
 const foliage=[mat('#477353'),mat('#648853'),mat('#90a764'),mat('#aac07f')];
 const bark=mat('#795c41');const capMat=mat('#cf7668');const cream=mat('#fff1cd');
 function tree(x,z,h,r){cylinder(root,.16,.3,h,x,h/2,z,bark);for(let j=0;j<5;j++){const a=j*2.4;ball(root,r,x+Math.cos(a)*r*.55,h-.2+Math.sin(j)*.35,z+Math.sin(a)*r*.5,foliage[j%4],[1,.9,1]);}}
 tree(-3.65,-1.85,3.9,1.12);tree(-2.1,-3.1,5.05,1.2);tree(2.85,-2.9,4.5,1.1);tree(4,-1.6,3.5,.85);
 // A miniature cottage facade shelters the map.
 box(root,2.8,2.9,.22,.3,1.75,-3.13,mat('#e4d8b7'));
 for(const x of [-1.1,1.7])box(root,.12,2.9,.3,x,1.75,-2.96,bark);
 const roof=new T.Mesh(new T.ConeGeometry(2.2,1.25,4),mat('#a96257'));roof.position.set(.3,3.8,-3.15);roof.rotation.y=Math.PI/4;roof.scale.z=.55;roof.castShadow=true;root.add(roof);
 const glow=new T.MeshStandardMaterial({color:'#ffe8a3',emissive:'#ffc96b',emissiveIntensity:1.3});
 function lantern(x,y,z){cylinder(root,.13,.17,.1,x,y+.23,z,bark);box(root,.2,.32,.2,x,y,z,glow);cylinder(root,.17,.13,.08,x,y-.2,z,bark);}
 for(let i=0;i<9;i++){const x=-3.6+i*.87;const y=4.05-.65*Math.sin(i/8*Math.PI);lantern(x,y,-2.35);if(i<8){const a=new T.Vector3(x,y+.3,-2.35),b=new T.Vector3(x+.87,4.35-.65*Math.sin((i+1)/8*Math.PI),-2.35);const line=new T.Line(new T.BufferGeometry().setFromPoints([a,b]),new T.LineBasicMaterial({color:'#715f42'}));root.add(line);}}
 function mushroom(x,z,s){cylinder(root,.11*s,.16*s,.5*s,x,.25*s,z,cream);ball(root,.43*s,x,.55*s,z,capMat,[1,.52,1]);for(let i=0;i<5;i++){const a=i*2.4;ball(root,.055*s,x+Math.cos(a)*.23*s,.72*s,z+Math.sin(a)*.22*s,cream,[1,.35,1]);}}
 mushroom(-3.6,1.8,1.25);mushroom(-3.05,2.35,.75);mushroom(3.65,1.25,1);mushroom(3.7,2,.65);
 for(let i=0;i<30;i++){const a=i*2.399,x=Math.cos(a)*(3.75+(i%3)*.22),z=Math.sin(a)*2.8;ball(root,.28,x,.12,z,foliage[i%4],[1.6,.7,1]);if(i%2===0){cylinder(root,.014,.016,.32,x,.3,z,foliage[0]);const petal=mat(i%4===0?'#ead58a':'#d49ab3');for(let j=0;j<5;j++){const b=j*Math.PI*2/5;ball(root,.065,x+Math.cos(b)*.075,.49,z+Math.sin(b)*.075,petal);}ball(root,.04,x,.515,z,cream);}}
 for(let i=0;i<4;i++){const stone=cylinder(root,.34,.37,.08,.35+Math.sin(i)*.2,.1,2.7+i*.24,mat('#c0b89b'));stone.scale.z=.5;}
 // A tiny rabbit at the edge of the clearing.
 ball(root,.23,-2.65,.29,2.75,cream,[.85,1.1,1]);ball(root,.17,-2.65,.55,2.8,cream);ball(root,.075,-2.74,.8,2.8,cream,[.7,2.4,.7]);ball(root,.075,-2.56,.8,2.8,cream,[.7,2.4,.7]);ball(root,.023,-2.55,.58,2.93,colors.ink);ball(root,.023,-2.7,.58,2.96,colors.ink);
 box(root,6.8,.22,2.8,0,1.72,.05,colors.wood);for(const x of [-2.9,2.9])for(const z of [-.95,1.05])box(root,.17,1.6,.17,x,.82,z,colors.edge);
 // Monitor: sample dashboard as a canvas texture.
 const pc=object('apac',-.65,1.84,-.45,[-.7,3.43,-.45]);box(pc,2.05,1.4,.14,0,.91,0,colors.ink);box(pc,.13,.45,.14,0,.22,0,colors.metal);box(pc,.75,.045,.45,0,0,.12,colors.metal);
 plane(pc,1.91,1.25,0,.91,.076,texture(768,480,(c,w,h)=>{c.fillStyle='#edf1f2';c.fillRect(0,0,w,h);c.fillStyle='#26374c';c.fillRect(0,0,140,h);c.fillStyle='#fff';c.font='bold 32px sans-serif';c.fillText('apac',24,54);c.fillStyle='#98aebf';c.font='16px sans-serif';['Overview','Insights','Compare'].forEach((t,i)=>c.fillText(t,20,140+i*52));c.fillStyle='#23364b';c.font='bold 30px sans-serif';c.fillText('Brand intelligence',174,62);c.fillStyle='#fff';c.fillRect(170,95,560,150);c.fillStyle='#5268df';[50,80,65,110,90,126,108].forEach((v,i)=>c.fillRect(200+i*69,235-v,35,v));c.fillStyle='#fff';c.fillRect(170,267,270,175);c.fillRect(460,267,270,175);c.strokeStyle='#82ad97';c.lineWidth=24;c.beginPath();c.arc(237,350,44,0,5);c.stroke();c.fillStyle='#a9b8c6';for(let i=0;i<4;i++)c.fillRect(485,298+i*31,210-i*17,9);}));
 box(pc,1.7,.05,.5,0,-.005,1,mat('#d5d9de'));for(let i=0;i<12;i++)box(pc,.09,.012,.32,-.7+i*.126,.03,1,colors.paper);
 // Map on the back wall.
 const map=object('city',.3,2.92,-3.03,[.2,4.16,-3.02]);box(map,2.1,1.73,.1,0,0,0,colors.paper);plane(map,1.94,1.55,0,0,.06,texture(640,510,(c,w,h)=>{c.fillStyle='#e3ece6';c.fillRect(0,0,w,h);c.fillStyle='#a9c6cf';c.beginPath();c.moveTo(0,220);c.bezierCurveTo(190,120,150,380,420,210);c.lineTo(640,180);c.lineTo(640,380);c.bezierCurveTo(400,450,170,290,0,420);c.fill();c.strokeStyle='#fff';c.lineWidth=6;for(let i=0;i<9;i++){c.beginPath();c.moveTo(i*85,0);c.lineTo(i*85-80,510);c.stroke();}c.fillStyle='#294a45';c.font='bold 38px sans-serif';c.fillText('CITY MOOD MAP',36,63);c.font='18px sans-serif';c.fillText('Hong Kong, felt differently.',36,96);[[100,210],[280,130],[390,175],[460,365],[170,385]].forEach(([x,y])=>{c.fillStyle='#c6545b';c.beginPath();c.arc(x,y,11,0,7);c.fill();});}));
 // Campaign poster, yoga mat and water bottle.
 const lulu=object('lulu',2.65,1.84,-.68,[2.65,3.6,-.76]);box(lulu,1.15,1.5,.1,0,.77,-.1,colors.paper);plane(lulu,1.05,1.39,0,.77,-.04,texture(380,500,(c,w,h)=>{c.fillStyle='#a22a43';c.fillRect(0,0,w,h);c.fillStyle='#f9eddc';c.font='62px Georgia';c.fillText('Sunday',25,125);c.fillText('Reset',25,195);c.fillText('Club',25,265);c.font='18px sans-serif';c.fillText('Move. Connect. Belong.',25,438);c.strokeStyle='#e8a9b2';c.lineWidth=2;c.beginPath();c.arc(340,350,125,0,7);c.stroke();}));const roll=cylinder(lulu,.2,.2,1.15,0,.2,.52,mat('#bca2b4'));roll.rotation.z=Math.PI/2;cylinder(lulu,.11,.11,.55,-.8,.275,.25,mat('#eee4d5'));cylinder(lulu,.075,.075,.08,-.8,.59,.25,colors.ink);
 // Folded newspaper.
 const news=object('editorial',-.95,1.85,1.0,[-1.3,2.18,1.18]);news.rotation.y=-.17;box(news,1.6,.035,.95,0,0,0,colors.paper);plane(news,1.55,.9,0,.025,0,texture(650,420,(c,w,h)=>{c.fillStyle='#f6f0de';c.fillRect(0,0,w,h);c.fillStyle='#38454b';c.font='bold 60px Georgia';c.fillText('The Daily',32,80);c.fillRect(28,97,595,3);c.font='bold 28px Georgia';c.fillText('Stories from the field',32,140);c.fillStyle='#a8b7b1';c.fillRect(30,168,270,205);c.fillStyle='#a7a197';for(let i=0;i<14;i++)c.fillRect(325,174+i*15,285-(i%3)*18,4);}),-Math.PI/2);
 // Camera body and lens.
 const video=object('media',1.05,1.92,1.04,[1.14,2.55,1.25]);box(video,.75,.44,.35,0,.2,0,colors.ink);const lens=cylinder(video,.18,.18,.25,0,.2,.27,colors.ink);lens.rotation.x=Math.PI/2;const glass=cylinder(video,.13,.13,.015,0,.2,.41,mat('#335c72',.12));glass.rotation.x=Math.PI/2;box(video,.3,.12,.24,.12,.47,0,colors.ink);cylinder(video,.07,.07,.04,-.23,.44,0,colors.metal);
 // Small open laptop.
 const laptop=object('app',-2.7,1.86,-.13,[-2.9,2.66,.08]);laptop.rotation.y=.25;box(laptop,1.05,.04,.7,0,0,.1,colors.blue);box(laptop,1.05,.7,.055,0,.36,-.24,colors.blue);plane(laptop,.93,.59,0,.36,-.209,texture(400,260,(c,w,h)=>{c.fillStyle='#879bcc';c.fillRect(0,0,w,h);c.fillStyle='#eef0f8';c.fillRect(135,22,230,210);c.fillStyle='#51618e';c.font='20px sans-serif';['Everyday tools','Clipboard','Shortcuts','Take a break'].forEach((t,i)=>c.fillText(t,151,60+i*43));}));
 // Studio details.
 const plant=new T.Group();plant.position.set(-3.7,0,-1.4);root.add(plant);cylinder(plant,.34,.25,.58,0,.3,0,mat('#e7dece'));for(let i=0;i<8;i++){const a=i*2.4;const leaf=ball(plant,.31,Math.cos(a)*.3,.95+i*.08,Math.sin(a)*.25,colors.leaf,[.65,1.8,.35]);leaf.rotation.z=Math.sin(a)*.6;}
 cylinder(root,.58,.63,.15,.2,.93,2.4,colors.blue);for(const x of [-.3,.7])for(const z of [2.1,2.7])box(root,.07,.9,.07,x,.45,z,colors.edge);
 box(root,1.55,.05,.7,3.1,.13,2.1,mat('#729188'));box(root,1.35,.06,.7,3.05,.19,2.1,colors.paper);box(root,1.3,.1,.7,3.1,.26,2.1,mat('#cfba80'));
 const mug=cylinder(root,.16,.13,.3,1.2,2.02,-.4,colors.paper);cylinder(root,.13,.13,.012,1.2,2.175,-.4,mat('#755e4f'));const handle=new T.Mesh(new T.TorusGeometry(.11,.03,8,24),colors.paper);handle.position.set(1.39,2.02,-.4);root.add(handle);
 // Each destination has its own geometry and clickable artefacts.
 const worlds={forest:root,pond:new T.Group(),library:new T.Group()};
 scene.add(worlds.pond,worlds.library);worlds.pond.visible=false;worlds.library.visible=false;
 let activeWorld='forest';targets.forEach(t=>t.world='forest');
 function artefact(world,id,x,y,z,anchor){const group=new T.Group();group.position.set(x,y,z);group.userData.project=id;worlds[world].add(group);targets.push({id,world,group,anchor:new T.Vector3(...anchor),base:y});return group;}
 function island(g,c){const earth=cylinder(g,4.7,4.2,.6,0,-.4,0,mat('#665c52'));earth.scale.z=.8;const top=cylinder(g,4.75,4.65,.2,0,-.04,0,mat(c));top.scale.z=.8;}
 function pine(g,x,z,h){cylinder(g,.13,.24,h,x,h/2,z,bark);for(let i=0;i<3;i++){const m=new T.Mesh(new T.ConeGeometry(1.1-i*.22,1.8,9),mat(i%2?'#4c7a79':'#385966'));m.position.set(x,h-1+i*.65,z);m.castShadow=true;g.add(m);}}
 function book(g,x,y,z,c,scale=1){box(g,.44*scale,.85*scale,.19*scale,x,y,z,mat(c));box(g,.37*scale,.75*scale,.195*scale,x+.02,y,z,cream);box(g,.055*scale,.85*scale,.21*scale,x-.21*scale,y,z,mat(c));}
 const pond=worlds.pond;island(pond,'#6c8791');
 const water=cylinder(pond,3.6,3.6,.055,-.25,.085,.3,new T.MeshStandardMaterial({color:'#547f9f',metalness:.38,roughness:.24}));water.scale.z=.72;
 for(let i=0;i<5;i++){const ring=new T.Mesh(new T.TorusGeometry(.32+i*.14,.012,6,64),mat('#9dc9d1'));ring.rotation.x=-Math.PI/2;ring.position.set(-1.8,.13,1);ring.scale.y=.7;pond.add(ring);}
 pine(pond,-3,-1.8,3.6);pine(pond,-1.5,-2.9,4.3);pine(pond,3,-2,3.5);
 // A high crescent moon, soft lanterns and a footbridge.
 const moonShape=new T.Shape();moonShape.absarc(0,0,.7,.2,Math.PI*2-.2,false);moonShape.absarc(.28,0,.56,-.25,Math.PI*2+.25,true);
 const moon=new T.Mesh(new T.ShapeGeometry(moonShape),new T.MeshBasicMaterial({color:'#fff0b0',side:T.DoubleSide}));moon.position.set(.4,4.4,-2.8);pond.add(moon);
 for(let i=0;i<13;i++){const x=-2.5+i*.39;const y=.3+Math.sin(i/12*Math.PI)*.37;box(pond,.36,.12,.95,x,y,1.95,mat('#a69a89'));if(i%3===0)for(const z of [1.48,2.42])cylinder(pond,.035,.045,.63,x,y+.34,z,bark);}
 for(let i=0;i<9;i++){const a=i*2.4;const pad=cylinder(pond,.24,.24,.024,Math.cos(a)*2.7,.13,Math.sin(a)*1.6,mat('#91a779'));pad.scale.x=1.25;ball(pond,.085,Math.cos(a)*2.7,.21,Math.sin(a)*1.6,mat('#e4b3cc'),[1,.65,1]);}
 const cityToken=artefact('pond','city',-1.25,.3,-.15,[-1.25,2,-.15]);
 cylinder(cityToken,.65,.78,.25,0,0,0,mat('#c0aa7d'));ball(cityToken,.6,0,.78,0,new T.MeshStandardMaterial({color:'#9ad7d1',roughness:.2,metalness:.22}));for(let i=0;i<5;i++)box(cityToken,.12,.2+i*.08,.15,-.32+i*.16,.72,-.05,mat('#5c8c84'));
 const mediaToken=artefact('pond','media',1.5,.22,-.55,[1.5,1.8,-.55]);box(mediaToken,1.2,.16,.65,0,0,0,mat('#b49772'));cylinder(mediaToken,.028,.028,1.3,0,.68,0,bark);const sail=new T.Mesh(new T.ConeGeometry(.53,.95,3),cream);sail.position.set(.25,.85,0);sail.rotation.z=-.3;mediaToken.add(sail);
 const restToken=artefact('pond','lulu',2.9,.25,1.2,[2.9,1.65,1.2]);cylinder(restToken,.42,.5,.15,0,0,0,bark);box(restToken,.42,.62,.42,0,.4,0,glow);const roofLantern=new T.Mesh(new T.ConeGeometry(.45,.35,4),mat('#886566'));roofLantern.position.y=.88;restToken.add(roofLantern);
 const fireflies=[];for(let i=0;i<20;i++){const a=i*2.4;const fly=ball(pond,.025,Math.cos(a)*3.4,.6+(i%5)*.45,Math.sin(a)*2.5,glow);fireflies.push({mesh:fly,y:fly.position.y,phase:i});}
 const library=worlds.library;island(library,'#9d9e75');
 // A giant mushroom becomes an open-air reading house.
 cylinder(library,1.3,1.65,2.9,.1,1.45,-1.4,mat('#eee0c4'));
 const mushroomRoof=ball(library,2.3,.1,3.2,-1.4,mat('#b96a76'),[1,.48,.85]);
 for(let i=0;i<10;i++){const a=i*2.4,r=.6+(i%3)*.4;ball(library,.15,.1+Math.cos(a)*r,4.16-r*.2,-1.4+Math.sin(a)*r*.75,cream,[1,.25,1]);}
 box(library,.8,1.65,.06,.1,.9,.24,mat('#7c665d'));ball(library,.055,.36,.94,.29,glow);
 for(const x of [-.85,.9]){box(library,.45,.55,.05,x,2,.02,glow);box(library,.03,.55,.07,x,2,.06,bark);}
 for(const x of [-2.7,2.7]){box(library,1.3,2.25,.42,x,1.25,-.5,mat('#735f4f'));for(let row=0;row<3;row++){box(library,1.25,.06,.54,x,.48+row*.67,-.38,colors.wood);for(let i=0;i<4;i++)book(library,x-.45+i*.29,.75+row*.67,-.1,['#a56877','#6e8b78','#bca05f','#8284a0'][i],.55);}}
 const editorialToken=artefact('library','editorial',-.5,.9,1.6,[-.5,2,1.6]);cylinder(editorialToken,.8,.9,.15,0,0,0,bark);cylinder(editorialToken,.22,.3,.85,0,-.5,0,bark);const leftPage=box(editorialToken,.6,.045,.85,-.28,.16,0,cream);leftPage.rotation.z=-.12;const rightPage=box(editorialToken,.6,.045,.85,.28,.16,0,cream);rightPage.rotation.z=.12;for(let i=0;i<6;i++)box(editorialToken,.42,.009,.012,-.28,.21,-.28+i*.1,mat('#b1a492'));
 const apacToken=artefact('library','apac',-2.75,1.4,.8,[-2.75,2.55,.8]);box(apacToken,.9,.65,.6,0,0,0,mat('#a58651'));box(apacToken,.95,.13,.65,0,.39,0,mat('#c3aa73'));box(apacToken,.14,.25,.025,0,.1,.315,glow);ball(apacToken,.07,0,.12,.36,mat('#e9d291'));
 const appToken=artefact('library','app',2.55,.5,1.35,[2.55,1.75,1.35]);box(appToken,.85,.75,.75,0,0,0,mat('#807292'));box(appToken,.89,.06,.78,0,.4,0,mat('#baabcf'));cylinder(appToken,.17,.17,.6,0,.73,0,mat('#bda973'));ball(appToken,.21,0,1.06,0,glow);
 for(let i=0;i<14;i++){const a=i*2.4;ball(library,.3,Math.cos(a)*4,.1,Math.sin(a)*2.75,foliage[i%4],[1,.55,1]);}pine(library,-3.7,-1.3,3);pine(library,3.6,-1.6,3.25);
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 // Project labels are native buttons so keyboard users can explore too.
 const shortNames={apac:'APAC insights',city:'City Mood Map',lulu:'Sunday Reset',editorial:'News stories',media:'Video & WeChat',app:'macOS app'};
 for(const item of targets){const p=projects.find(p=>p.id===item.id);const b=document.createElement('button');b.className='hotspot';b.dataset.project=item.id;b.innerHTML=`<span style="background:${p.color}"></span>${shortNames[item.id]}<i>↗</i>`;b.setAttribute('aria-label',`Open ${p.name}`);labels.appendChild(b);item.label=b;b.onmouseenter=()=>selected=item.id;b.onmouseleave=()=>selected=null;b.onfocus=()=>selected=item.id;b.onblur=()=>selected=null;}
 const raycaster=new T.Raycaster();const pointer=new T.Vector2();let down;
 function hit(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(targets.filter(t=>t.world===activeWorld).map(t=>t.group),true);if(!hits.length)return null;let o=hits[0].object;while(o&&!o.userData.project)o=o.parent;return o?.userData.project;}
 renderer.domElement.addEventListener('pointermove',e=>{selected=hit(e);renderer.domElement.style.cursor=selected?'pointer':'grab';});renderer.domElement.addEventListener('pointerleave',()=>selected=null);renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6){const id=hit(e);if(id)onSelect(id);}down=null;});
 function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.fov=w<650?50:36;camera.updateProjectionMatrix();renderer.setSize(w,h);}
 new ResizeObserver(resize).observe(container);resize();const projected=new T.Vector3();
 function tick(time=0){requestAnimationFrame(tick);if(!container.clientWidth)return;controls.update();if(activeWorld==='pond'&&!reducedMotion.matches)for(const f of fireflies)f.mesh.position.y=f.y+Math.sin(time*.001+f.phase)*.13;for(const item of targets){item.label.hidden=item.world!==activeWorld;if(item.label.hidden)continue;item.group.position.y+=(item.base+(selected===item.id ? .035 : 0)-item.group.position.y)*.12;projected.copy(item.anchor).project(camera);item.label.style.left=`${(projected.x*.5+.5)*container.clientWidth}px`;item.label.style.top=`${(-projected.y*.5+.5)*container.clientHeight}px`;item.label.classList.toggle('is-hovered',selected===item.id);}renderer.render(scene,camera);}tick();
 return{resize,setWorld(name){if(!worlds[name])return;activeWorld=name;selected=null;for(const [key,g]of Object.entries(worlds))g.visible=key===name;sun.color.set(name==='pond'?'#c7d8ff':'#ff dca3'.replace(' ',''));sun.intensity=name==='pond'?1.5:3.5;renderer.toneMappingExposure=name==='pond'?1.05:1.3;camera.position.set(11,10,13);controls.target.set(0,1.4,0);controls.update();},reset(){camera.position.set(11,10,13);controls.target.set(0,1.4,0);controls.update();}};
}
