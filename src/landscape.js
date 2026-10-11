import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Entirely procedural low-poly landscapes. Buildings are the project entrances.
export function mountStudio(container, labels, projects, onSelect) {
 const scene=new T.Scene(), camera=new T.PerspectiveCamera(37,1,.1,160);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.15;container.appendChild(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=true;controls.enablePan=false;controls.enableZoom=false;
 controls.minPolarAngle=.45;controls.maxPolarAngle=1.15;
 const hemi=new T.HemisphereLight('#fff3d3','#596c76',2.2);scene.add(hemi);
 const sun=new T.DirectionalLight('#ffe6b4',3);sun.position.set(-12,23,14);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24});sun.shadow.normalBias=.07;scene.add(sun);
 const worlds={forest:new T.Group(),pond:new T.Group(),library:new T.Group()};
 Object.values(worlds).forEach(g=>scene.add(g));let active='forest',hover=null;const targets=[];
 const materialCache=new Map();
 function mat(color){if(!materialCache.has(color))materialCache.set(color,new T.MeshStandardMaterial({color,flatShading:true,roughness:.88}));return materialCache.get(color);}
 function mesh(g,geometry,color,x,y,z){const m=new T.Mesh(geometry,typeof color==='string'?mat(color):color);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 const box=(g,w,h,d,x,y,z,c)=>mesh(g,new T.BoxGeometry(w,h,d),c,x,y,z);
 const cylinder=(g,r1,r2,h,x,y,z,c,n=6)=>mesh(g,new T.CylinderGeometry(r1,r2,h,n),c,x,y,z);
 const rock=(g,r,x,y,z,c,s=[1,1,1])=>{const m=mesh(g,new T.IcosahedronGeometry(r,0),c,x,y,z);m.scale.set(...s);return m;};
 const cream='#f0dfb2',bark='#795940',path='#d7c292';
 const light=new T.MeshStandardMaterial({color:'#ffe6a6',emissive:'#f1b752',emissiveIntensity:.8,flatShading:true});
 function land(g,c){const shape=new T.Shape();for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=11.5+Math.sin(i*4.1)*.8;const x=Math.cos(a)*r,z=Math.sin(a)*r*.72;i?shape.lineTo(x,z):shape.moveTo(x,z);}shape.closePath();const geom=new T.ExtrudeGeometry(shape,{depth:1.25,bevelEnabled:false});geom.rotateX(-Math.PI/2);mesh(g,geom,'#887b61',0,-1.3,0);const top=new T.ShapeGeometry(shape);top.rotateX(-Math.PI/2);mesh(g,top,c,0,.01,0);}
 function trail(g,points,width=1.05){for(let i=1;i<points.length;i++){const [x,z]=points[i-1],[xx,zz]=points[i];const length=Math.hypot(xx-x,zz-z),b=box(g,width,.045,length,(x+xx)/2,.065,(z+zz)/2,path);b.rotation.y=Math.atan2(xx-x,zz-z);}}
 function pine(g,x,z,h=3,c='#577e5b'){cylinder(g,.13,.23,h*.65,x,h*.28,z,bark);for(let i=0;i<3;i++)cylinder(g,0,h*(.28-i*.055),h*.57,x,h*(.48+i*.18),z,i===1?'#7a955e':c,5);}
 function roundTree(g,x,z,h=3){cylinder(g,.12,.25,h*.75,x,h*.35,z,bark);rock(g,h*.37,x,h*.8,z,'#78995b',[1,1.2,1]);rock(g,h*.29,x+.45,h*.64,z+.3,'#a5b371');}
 function hills(g,c){for(let i=0;i<8;i++){const x=-9+i*2.7,z=-5.8+Math.sin(i)*.5;const m=cylinder(g,0,2.7,2.2+(i%3)*1.1,x,1+(i%3)*.55,z,c,5);m.rotation.y=i;}}
 function woodland(g,seed=0){for(let i=0;i<38;i++){const a=i*2.399+seed,r=8.5+(i%4)*.55,x=Math.cos(a)*r,z=Math.sin(a)*r*.69;if(z>2&&Math.abs(x)<5)continue;(i%3?pine:roundTree)(g,x,z,2+(i%5)*.35);}for(let i=0;i<28;i++){const a=i*2.4;rock(g,.28+(i%3)*.12,Math.cos(a)*10.5,.12,Math.sin(a)*7.2,'#9fa889',[1,.6,1]);}}
 function landmark(world,id,x,z,name,height){const g=new T.Group();g.position.set(x,0,z);g.userData.project=id;worlds[world].add(g);targets.push({world,id,g,name,anchor:new T.Vector3(x,height,z)});return g;}
 function cottage(g,color='#b47768',size=1){const b=new T.Group();b.scale.setScalar(size);g.add(b);box(b,2.6,2.1,2.2,0,1.05,0,cream);const roof=cylinder(b,0,2.2,1.4,0,2.75,0,color,4);roof.rotation.y=Math.PI/4;roof.scale.z=.9;box(b,.55,1.25,.08,0,.63,1.14,bark);for(const x of [-.8,.8])box(b,.42,.55,.06,x,1.25,1.15,light);box(b,.34,.9,.35,.8,3.1,-.4,'#9f8b77');return b;}
 function tower(g){cylinder(g,.8,1.1,3.8,0,1.9,0,'#e4cfa0');cylinder(g,1.35,1.35,.22,0,3.3,0,'#92704d');for(let i=0;i<6;i++){const a=i*Math.PI/3;box(g,.2,.7,.35,Math.cos(a)*.73,3.88,Math.sin(a)*.73,light);}cylinder(g,0,1.4,1.4,0,4.9,0,'#648c96');const scope=cylinder(g,.21,.25,1.6,.6,4.7,.7,'#b9a277');scope.rotation.z=-.7;scope.rotation.x=1;return g;}
 function pavilion(g){cylinder(g,2.1,2.1,.2,0,.12,0,'#c8b492');for(let i=0;i<6;i++){const a=i*Math.PI/3;cylinder(g,.07,.1,2.2,Math.cos(a)*1.5,1.3,Math.sin(a)*1.5,bark);}cylinder(g,0,2.35,1.2,0,3,0,'#b77584');}
 function bridge(g,x,z,length=4){for(let i=0;i<12;i++){const a=-length/2+i*length/11;box(g,.31,.15,1.3,x+a,.45+Math.sin(i/11*Math.PI)*.35,z,'#b59b73');if(i%3===0)for(const side of [-.7,.7])cylinder(g,.045,.06,.65,x+a,.85,z+side,bark);}for(const side of [-.7,.7])box(g,length,.06,.07,x,1.1,z+side,bark);}
 function banner(g,x,z,c){cylinder(g,.035,.06,2.4,x,1.2,z,bark);box(g,.7,.55,.035,x+.36,2,z,c);}
 function city(g){cylinder(g,2,2.2,.35,0,.18,0,'#b4baa1');for(let i=0;i<7;i++){const x=(i%3-1)*.8,z=(Math.floor(i/3)-1)*.7,h=.8+(i%4)*.55;box(g,.55,h,.55,x,h/2+.35,z,['#91b3a8','#769ca8','#cfb690'][i%3]);for(let j=0;j<3;j++)box(g,.18,.14,.01,x,j*.4+.7,z+.28,light);}}
 const forest=worlds.forest;land(forest,'#98ad71');hills(forest,'#78916d');woodland(forest);
 trail(forest,[[0,7],[0,3],[-3,1],[-5,-2]]);trail(forest,[[0,3],[5,2],[6,-2]]);trail(forest,[[-3,1],[-6,4]]);trail(forest,[[0,3],[1,-2]]);
 const stream=box(forest,2,.035,14,2.6,.09,0,'#88baba');stream.rotation.y=-.24;bridge(forest,3,2,4);
 const insight=tower(landmark('forest','apac',-7.8,-8,'Insight observatory',5.8));
 insight.traverse(o=>{if(o.material){o.renderOrder=10;o.material.depthTest=false;}});
 city(landmark('forest','city',0,-3,'City of feelings',4));
 pavilion(landmark('forest','lulu',7,-1,'Sunday meadow',4.4));
 cottage(landmark('forest','editorial',-7,4.5,'The story house',4),'#b56f64',1.05);
 const cinema=landmark('forest','media',7,4.5,'Woodland cinema',3.5);box(cinema,2.6,1.55,.17,0,1.6,0,'#efdfb3');for(const x of [-1.25,1.25])box(cinema,.12,2,.18,x,.9,0,bark);const play=mesh(cinema,new T.CircleGeometry(.35,3),'#9e6876',0,1.65,.1);play.rotation.z=-Math.PI/2;for(let i=0;i<3;i++)box(cinema,1.5,.25,.3,0,.3,1+i*.6,'#9b8256');
 cottage(landmark('forest','hanlin',-1,6.2,'WeChat studio',3.8),'#6f8f86',.78);
 const mill=landmark('forest','app',3.5,5.6,'Maker’s windmill',4.8);cottage(mill,'#8393ad',.8);const sails=new T.Group();sails.position.set(0,3.15,1.45);mill.add(sails);for(let i=0;i<4;i++){const blade=box(sails,.19,1.7,.08,0,.65,0,cream);const pivot=new T.Group();sails.remove(blade);pivot.add(blade);pivot.rotation.z=i*Math.PI/2;sails.add(pivot);}
 banner(forest,-1.5,6,'#b284a0');banner(forest,1.5,6,'#cebd72');
 const pond=worlds.pond;land(pond,'#718d8b');hills(pond,'#516f83');woodland(pond,1);
 const lake=cylinder(pond,6.5,6.5,.05,0,.11,.5,'#578faa',12);lake.scale.z=.73;
 bridge(pond,-3.7,3.4,5);trail(pond,[[-8,4],[-6,3.4],[-6,-2]]);trail(pond,[[0,6],[4,5],[7,1]]);
 const harbour=landmark('pond','city',-2,-1,'Memory harbour',4);city(harbour);box(harbour,3,.18,1.2,0,.3,2,'#bc9c77');
 const lighthouse=landmark('pond','media',6,-2,'Story lighthouse',6);cylinder(lighthouse,.65,1.05,3.8,0,1.9,0,'#ded8c3');cylinder(lighthouse,1.05,1.05,.18,0,3.85,0,'#a7757d');cylinder(lighthouse,.65,.65,.7,0,4.28,0,light);cylinder(lighthouse,0,1,1,0,5.1,0,'#a7757d');
 const retreat=landmark('pond','lulu',4.8,4.7,'Lakeside retreat',4);pavilion(retreat);box(retreat,3.9,.16,3.7,0,.02,0,'#b9a184');
 for(let i=0;i<8;i++){const a=i*2.4;cylinder(pond,.35,.35,.035,Math.cos(a)*4,.16,Math.sin(a)*2.5,'#93aa7e',5);}
 const boat=new T.Group();boat.position.set(-1,.25,3.2);pond.add(boat);const hull=rock(boat,1,0,0,0,'#b29b7a',[.7,.25,1.5]);cylinder(boat,.025,.025,1.8,0,.9,0,cream);const sail=mesh(boat,new T.CircleGeometry(.8,3),cream,.25,1.1,0);sail.rotation.z=.5;
 rock(pond,.75,-2,7,-6,'#fff0ba');
 const library=worlds.library;land(library,'#a1a577');hills(library,'#969c75');woodland(library,2);
 trail(library,[[0,7],[0,3],[0,-1]]);trail(library,[[-7,2],[0,3],[7,2]]);
 const house=landmark('library','editorial',0,-2,'The great story library',6);cylinder(house,1.5,1.9,3.3,0,1.65,0,cream,8);const cap=rock(house,3,0,3.7,0,'#b5778b',[1,.52,1]);box(house,.8,1.8,.1,0,.9,1.8,bark);for(const x of [-1,1])box(house,.5,.7,.1,x,2,1.5,light);
 const archive=landmark('library','apac',-6,1.5,'The insight archive',4.8);cottage(archive,'#6e9490',1.2);for(let i=0;i<3;i++)box(archive,.75,.16,.8,-1.3,.15+i*.19,2,['#9f7995','#c4a16c','#7f9d92'][i]);
 const workshop=landmark('library','app',5,2,'Inventor’s cottage',4.4);cottage(workshop,'#8c83a5',1.15);const wheel=mesh(workshop,new T.TorusGeometry(.7,.1,4,8),'#a0865e',1.7,1.1,.5);wheel.rotation.y=Math.PI/2;
 for(const x of [-3,3])for(let i=0;i<3;i++){cylinder(library,.12,.18,.7,x,.35,3+i*.8,cream);rock(library,.5,x,.8,3+i*.8,'#c28b8e',[1,.5,1]);}
 for(const g of Object.values(worlds)){for(let i=0;i<18;i++){const a=i*2.4,x=Math.cos(a)*9,z=Math.sin(a)*6;cylinder(g,.018,.025,.35,x,.25,z,'#67845b');rock(g,.09,x,.5,z,i%2?'#d9a6aa':'#ead397');}}
 const names=Object.fromEntries(projects.map(p=>[p.id,p]));
 for(const t of targets){const b=document.createElement('button');b.className='hotspot landmark-label';b.dataset.project=t.id;b.setAttribute('aria-label',`Open ${names[t.id].name}`);b.innerHTML=`<span style="background:${names[t.id].color}"></span><b>${t.name}<small>${names[t.id].name}</small></b><i>↗</i>`;labels.appendChild(b);t.label=b;b.onclick=null;b.onmouseenter=b.onfocus=()=>hover=t;b.onmouseleave=b.onblur=()=>hover=null;}
 const ray=new T.Raycaster(),pointer=new T.Vector2();let down;
 function hit(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(worlds[active].children,true);if(!hits.length)return null;let o=hits[0].object;while(o&&!o.userData.project)o=o.parent;return targets.find(t=>t.g===o)||null;}
 renderer.domElement.addEventListener('pointermove',e=>{hover=hit(e);renderer.domElement.style.cursor=hover?'pointer':'grab';});renderer.domElement.addEventListener('pointerleave',()=>hover=null);renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6){const t=hit(e);if(t)onSelect(t.id);}down=null;});
 // Bring the landscape closer so the low-poly landmarks read clearly at a glance.
 let zoom=1;const defaultPos=new T.Vector3(18,17,23);
 function reset(){zoom=1;controls.target.set(0,1,0);camera.position.copy(defaultPos);controls.update();}
 function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.fov=w<650?52:34;camera.updateProjectionMatrix();renderer.setSize(w,h);}
 function setWorld(name){if(!worlds[name])return;active=name;hover=null;for(const [key,g]of Object.entries(worlds))g.visible=key===active;sun.color.set(name==='pond'?'#c4dcff':'#ffe6b4');sun.intensity=name==='pond'?1.5:3;hemi.intensity=name==='pond'?1.8:2.2;reset();}
 reset();setWorld('forest');new ResizeObserver(resize).observe(container);resize();
 const v=new T.Vector3(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function tick(time=0){requestAnimationFrame(tick);if(!container.clientWidth||document.hidden)return;controls.update();if(!reduced.matches){sails.rotation.z=time*.00012;boat.position.y=.25+Math.sin(time*.0007)*.05;}for(const t of targets){t.label.hidden=t.world!==active;if(t.label.hidden)continue;v.copy(t.anchor).project(camera);t.label.hidden=v.z>1||Math.abs(v.x)>1.15||Math.abs(v.y)>1.15;t.label.style.left=`${(v.x*.5+.5)*container.clientWidth}px`;t.label.style.top=`${(-v.y*.5+.5)*container.clientHeight}px`;t.label.classList.toggle('is-hovered',hover===t);}renderer.render(scene,camera);}tick();
 return{resize,reset,setWorld,zoomBy(factor){const next=T.MathUtils.clamp(zoom*factor,.72,1.5);camera.position.sub(controls.target).multiplyScalar(zoom/next).add(controls.target);zoom=next;controls.update();}};
}
