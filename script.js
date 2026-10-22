/* ===== НАСТРОЙКИ: вставьте свои ссылки ===== */
const GAME_URL="";   // ссылка на game.html в интернете. Если оставить пустой, QR-код создастся сам из адреса сайта
const TEAM=[["Участник 1","Экскурсовод и исследователь"],["Участник 2","Экскурсовод и исследователь"],["Участник 3","Экскурсовод и исследователь"]];

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

/* Порядок экспонатов = порядок функций в MODELS ниже */
const E=[
{n:"Золотой человек",e:"IV–III вв. до н.э.",c:"Археология",mt:"Золото",d:"Реконструкция находки из Иссыкского кургана — один из главных образов раннего кочевого мира Казахстана."},
{n:"Оружие и конская упряжь",e:"Ранние кочевники",c:"Археология",mt:"Бронза, кость, металл",d:"Наконечники стрел, копья и элементы упряжи показывают военную и конную культуру древних степных обществ."},
{n:"Бронзовые котлы",e:"Сакское время",c:"Археология",mt:"Бронза",d:"Котлы и жертвенники — характерные предметы культуры ранних кочевников. Они рассказывают о быте и обрядах."},
{n:"Каргалинское золото",e:"Археологические клады",c:"Археология",mt:"Золото",d:"Золотые изделия из Каргалинского клада — одни из самых выразительных археологических материалов музея."},
{n:"Китайский фарфор",e:"Великий Шёлковый путь",c:"Шёлковый путь",mt:"Керамика",d:"Предметы импорта показывают, как по торговым путям в Семиречье и Южный Казахстан приходили вещи и технологии издалека."},
{n:"Тюркские изваяния",e:"Средние века",c:"Археология",mt:"Камень",d:"Каменные изваяния — наследие тюркских кочевников и важный источник знаний об их представлениях о мире."},
{n:"Следы древнего письма",e:"Кангюй, IV в. до н.э. – IV в. н.э.",c:"Археология",mt:"Керамика, металл",d:"Памятники письменности из раскопок долины Арыси отражают развитие культуры Южного Казахстана."},
{n:"Иранское блюдо",e:"Археология, импорт",c:"Шёлковый путь",mt:"Медь",d:"Фрагмент медного иранского блюда — свидетельство международных культурных контактов на территории Казахстана."},
{n:"Қазақ кілемі",e:"Историческая этнография",c:"Этнография",mt:"Шерсть",d:"Музей хранит богатую коллекцию ковров и текстиля. Орнамент здесь — язык памяти, быта и обрядов."},
{n:"Женский костюм",e:"Традиционная культура",c:"Этнография",mt:"Ткань, украшения",d:"Реконструкции одежды помогают увидеть не только форму костюма, но и социальные особенности эпохи."},
{n:"Радио «Sanyo»",e:"XX век",c:"XX век",mt:"Пластик, металл",d:"Транзисторный радиоприёмник связан с историей казахстанского радио и представлен на музейных выставках."}
];

/* =========================================================
   3D: ПОМОЩНИКИ (процедурные текстуры и геометрия)
   ========================================================= */
const TAU=Math.PI*2;
let _s=11;const R=()=>(_s=(_s*16807)%2147483647)/2147483647;
const V2=(a,b)=>new THREE.Vector2(a,b),V3=(a,b,c)=>new THREE.Vector3(a,b,c);
const col=h=>new THREE.Color(h).convertSRGBToLinear();
const MEMO={};const memo=(k,f)=>(MEMO[k]||(MEMO[k]=f()));
const cv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c};
function T(c,o={}){const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.wrapT=o.ct?THREE.ClampToEdgeWrapping:THREE.RepeatWrapping;if(o.r)t.repeat.set(o.r[0],o.r[1]);t.anisotropy=8;if(!o.lin)t.encoding=THREE.sRGBEncoding;return t}
function blotch(w,h,base,cols,n,r0,r1,al){return cv(w,h,x=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<n;i++){x.globalAlpha=al*(.4+R()*.6);x.fillStyle=cols[(R()*cols.length)|0];x.beginPath();x.arc(R()*w,R()*h,r0+R()*(r1-r0),0,TAU);x.fill()}x.globalAlpha=1})}
function grain(c,amt){const x=c.getContext('2d'),d=x.getImageData(0,0,c.width,c.height),p=d.data;for(let i=0;i<p.length;i+=4){const n=(R()-.5)*amt;p[i]+=n;p[i+1]+=n;p[i+2]+=n}x.putImageData(d,0,0);return c}
const mk=(g,m,p=[0,0,0],r=[0,0,0],s)=>{const o=new THREE.Mesh(g,m);o.position.set(p[0],p[1],p[2]);o.rotation.set(r[0],r[1],r[2]);if(s)o.scale.set(s[0],s[1],s[2]);return o};
const smooth=(p,n)=>new THREE.SplineCurve(p.map(a=>V2(a[0],a[1]))).getPoints(n);
const cat=(...a)=>[].concat(...a);
function lathe(pts,seg=64,vf){const g=new THREE.LatheGeometry(pts,seg);if(vf){const uv=g.attributes.uv,n=pts.length;for(let i=0;i<uv.count;i++){const j=i%n;uv.setY(i,vf(j,pts[j]))}uv.needsUpdate=true}return g}
const radAt=(pts,y)=>{for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];if(b.y>a.y&&a.y<=y&&b.y>=y)return a.x+(b.x-a.x)*(y-a.y)/(b.y-a.y)}return pts[pts.length-1].x};
function rough(g,a,f){const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=Math.sin(x*f+y*1.3*f)*Math.sin(z*f*1.1-y*f)+.5*Math.sin(x*f*2.7+z*f*2.1+y*f*.7)*Math.cos(y*f*2.3);p.setXYZ(i,x*(1+n*a),y+n*a*.25,z*(1+n*a))}g.computeVertexNormals();return g}
function rrect(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
function limb(a,b,r0,r1,mat){const A=V3(a[0],a[1],a[2]),B=V3(b[0],b[1],b[2]),d=B.clone().sub(A),L=d.length(),g=new THREE.Group(),m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,L,20),mat);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize());g.add(m);[[A,r0],[B,r1]].forEach(q=>{const s=new THREE.Mesh(new THREE.SphereGeometry(q[1],20,14),mat);s.position.copy(q[0]);g.add(s)});return g}

/* ---------- материалы ---------- */
const std=(c,r=.7,m=0,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:col(c),roughness:r,metalness:m,side:THREE.DoubleSide},o));
const hamC=()=>memo('ham',()=>grain(blotch(256,256,'#808080',['#6a6a6a','#9a9a9a','#767676','#8c8c8c'],280,3,14,.5),16));
const gold=(rep=[3,3],r=.26)=>new THREE.MeshStandardMaterial({color:new THREE.Color(1,.77,.33),metalness:1,roughness:r,bumpMap:T(hamC(),{lin:1,r:rep}),bumpScale:1.4,side:THREE.DoubleSide});
const chrome=()=>new THREE.MeshStandardMaterial({color:new THREE.Color(.9,.9,.92),metalness:1,roughness:.16});
function bronzeMat(rep=[2,2],patina=1){const c=memo('bronzeC'+patina,()=>grain(blotch(512,512,'#8a5a2b',patina?['#a86f35','#6b4320','#3f7f6b','#4c9a82','#2f5f50','#7a4e26']:['#a86f35','#6b4320','#7a4e26','#935f2d'],patina?460:300,6,34,.35),14));return new THREE.MeshStandardMaterial({map:T(c,{r:rep}),color:0xffffff,metalness:.7,roughness:.52,bumpMap:T(c,{lin:1,r:rep}),bumpScale:2,side:THREE.DoubleSide})}
function stoneMat(rep=[2,3]){const c=memo('stoneC',()=>{const b=blotch(512,512,'#8d8a7e',['#7a776c','#9c988b','#6f6c62','#a39f8f','#7f8a62','#b19e6f'],520,4,40,.26);return grain(b,26)});return new THREE.MeshStandardMaterial({map:T(c,{r:rep}),color:0xffffff,roughness:.96,metalness:0,bumpMap:T(c,{lin:1,r:rep}),bumpScale:3,side:THREE.DoubleSide})}
function fabric(c,r=.9){return std(c,r,0,{})}

/* ---------- студийное окружение (отражения для металла и глазури) ---------- */
function makeEnv(r){
 const pm=new THREE.PMREMGenerator(r),sc=new THREE.Scene();
 const dome=cv(512,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#46566a');g.addColorStop(.55,'#232b30');g.addColorStop(1,'#0e1214');x.fillStyle=g;x.fillRect(0,0,w,h)});
 const dt=new THREE.CanvasTexture(dome);dt.encoding=THREE.sRGBEncoding;
 sc.add(new THREE.Mesh(new THREE.SphereGeometry(20,32,16),new THREE.MeshBasicMaterial({map:dt,side:THREE.BackSide})));
 const panel=(w,h,c,k,p)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(k),side:THREE.DoubleSide}));m.position.set(p[0],p[1],p[2]);m.lookAt(0,0,0);sc.add(m)};
 panel(9,6,0xfff1d6,7,[7,9,8]);panel(5,12,0xbcd8ff,2.6,[-12,3,4]);panel(14,2,0xffffff,3.5,[0,6,-13]);panel(10,10,0xffe9c4,1.6,[0,16,0]);panel(4,8,0xffc98a,2.2,[12,0,-6]);
 const t=pm.fromScene(sc,.03).texture;pm.dispose();return t}

/* =========================================================
   3D: МОДЕЛИ ЭКСПОНАТОВ
   ========================================================= */

/* 0. Золотой человек: воин в одежде, расшитой золотыми бляшками */
function mGolden(){
 const g=new THREE.Group(),gd=gold([4,4],.3),skin=std(0xb98a65,.62),lea=std(0x4a1d14,.85),dk=std(0x16100c,.5);
 [-1,1].forEach(s=>{
  g.add(mk(new THREE.CylinderGeometry(.092,.11,.42,28),gd,[s*.12,.21,0]));
  g.add(mk(new THREE.SphereGeometry(.12,24,16),gd,[s*.12,.07,.07],[0,0,0],[.95,.55,1.9]));
  g.add(limb([s*.12,.4,0],[s*.125,.95,0],.105,.125,lea));
  g.add(mk(new THREE.TorusGeometry(.105,.012,8,28),gd,[s*.12,.42,0],[Math.PI/2,0,0]));
 });
 const tp=smooth([[.27,.84],[.29,.95],[.27,1.1],[.255,1.3],[.245,1.5],[.17,1.6],[.07,1.65],[0,1.66]],32);
 const tun=mk(lathe(tp,56),lea);tun.scale.z=.74;g.add(tun);
 const rows=[];for(let y=.87;y<1.56;y+=.062)rows.push(y);
 const pg=new THREE.CylinderGeometry(.033,.033,.007,12);pg.rotateZ(Math.PI/2);
 const im=new THREE.InstancedMesh(pg,gd,rows.length*20),d=new THREE.Object3D();let k=0;
 rows.forEach((y,ri)=>{const r=radAt(tp,y);for(let a=0;a<20;a++){const th=(a+(ri%2?.5:0))/20*TAU;d.position.set(Math.cos(th)*(r+.004),y,Math.sin(th)*(r+.004)*.74);d.rotation.set(0,-th,0);d.scale.setScalar(.9+R()*.2);d.updateMatrix();im.setMatrixAt(k++,d.matrix)}});
 g.add(im);
 g.add(mk(new THREE.TorusGeometry(.272,.02,10,56),gd,[0,1.0,0],[Math.PI/2,0,0],[1,.74,1]));
 g.add(mk(new THREE.CylinderGeometry(.05,.05,.015,20),gd,[0,1.0,.205],[Math.PI/2,0,0]));
 [-1,1].forEach(s=>{
  g.add(limb([s*.275,1.5,0],[s*.35,1.22,.05],.07,.06,lea));
  g.add(limb([s*.35,1.22,.05],[s*.3,.98,.19],.06,.052,lea));
  g.add(mk(new THREE.SphereGeometry(.05,16,12),skin,[s*.3,.92,.21]));
  g.add(mk(new THREE.TorusGeometry(.056,.012,8,20),gd,[s*.3,.99,.19],[1.1,0,s*.3]));
  g.add(mk(new THREE.SphereGeometry(.07,20,14),gd,[s*.275,1.55,0]));
 });
 g.add(mk(new THREE.CylinderGeometry(.055,.065,.14,20),skin,[0,1.7,0]));
 g.add(mk(new THREE.SphereGeometry(.115,32,24),skin,[0,1.83,0],[0,0,0],[.9,1.12,1]));
 g.add(mk(new THREE.ConeGeometry(.02,.06,10),skin,[0,1.81,.115],[Math.PI/2,0,0]));
 [-1,1].forEach(s=>{g.add(mk(new THREE.SphereGeometry(.012,10,8),dk,[s*.04,1.855,.1]));g.add(mk(new THREE.SphereGeometry(.026,12,10),skin,[s*.105,1.83,0],[0,0,0],[.5,1,.8]))});
 const cp=smooth([[.128,1.86],[.132,1.95],[.118,2.15],[.088,2.4],[.048,2.62],[0,2.8]],30);
 g.add(mk(lathe(cp,40),gd));
 g.add(mk(new THREE.TorusGeometry(.133,.014,10,40),gd,[0,1.9,0],[Math.PI/2,0,0]));
 [-1,0,1].forEach(i=>g.add(mk(new THREE.ConeGeometry(.016,.22,8),gd,[i*.035,2.9,0],[0,0,-i*.28])));
 const sh=mk(new THREE.BoxGeometry(.055,.42,.022),dk,[.25,.8,.08],[0,0,-.16]);g.add(sh);
 g.add(mk(new THREE.BoxGeometry(.06,.05,.03),gd,[.265,.62,.08],[0,0,-.16]));
 g.add(mk(new THREE.CylinderGeometry(.018,.018,.16,12),gd,[.28,.98,.08],[0,0,-.16]));
 g.add(mk(new THREE.BoxGeometry(.14,.02,.03),gd,[.275,1.06,.08],[0,0,-.16]));
 return{g,pd:1};
}

/* 1. Оружие и упряжь: находки на бархатной подложке */
function mWeapons(){
 const g=new THREE.Group(),vel=std(0x16262b,1),wood=std(0x6b4527,.7),bronze=bronzeMat([2,2],0),bone=std(0xd8cbb0,.55),gd=gold(),fe=std(0xcdb892,.9);
 g.add(mk(new THREE.BoxGeometry(2.9,.08,1.8),vel));
 [.9,-.9].forEach(z=>g.add(mk(new THREE.BoxGeometry(2.94,.04,.03),gd,[0,.02,z])));
 [1.45,-1.45].forEach(x=>g.add(mk(new THREE.BoxGeometry(.03,.04,1.84),gd,[x,.02,0])));
 const y=.04;
 const sp=new THREE.Group();
 sp.add(mk(new THREE.CylinderGeometry(.028,.03,2.05,14),wood,[0,0,0],[0,0,Math.PI/2]));
 sp.add(mk(lathe(smooth([[0,0],[.05,.05],[.085,.2],[.07,.4],[.035,.57],[0,.66]],20),24),bronze,[1.03,0,0],[0,0,-Math.PI/2],[.28,1,1]));
 sp.add(mk(new THREE.CylinderGeometry(.04,.034,.14,14),bronze,[1.03,0,0],[0,0,Math.PI/2]));
 sp.position.set(-.2,y+.03,-.55);sp.rotation.y=.04;g.add(sp);
 const arrow=len=>{const a=new THREE.Group();
  a.add(mk(new THREE.CylinderGeometry(.011,.011,len,8),wood,[0,0,0],[0,0,Math.PI/2]));
  a.add(mk(new THREE.ConeGeometry(.042,.15,3),bronze,[len/2+.07,0,0],[0,0,-Math.PI/2]));
  [0,1,2].forEach(i=>a.add(mk(new THREE.BoxGeometry(.2,.003,.03),fe,[-len/2+.12,0,0],[i*TAU/3,0,0])));
  return a};
 for(let k=0;k<4;k++){const a=arrow(1.25-k*.03);a.position.set(-.55+k*.03,y+.02,-.12+k*.11);a.rotation.y=(k-1.5)*.03;g.add(a)}
 const bit=new THREE.Group();
 [-.2,.2].forEach(x=>{bit.add(mk(new THREE.TorusGeometry(.12,.014,10,32),bronze,[x,0,0],[Math.PI/2,0,0]));bit.add(mk(new THREE.CylinderGeometry(.016,.016,.34,10),bone,[x,0,0],[Math.PI/2,0,0]))});
 bit.add(mk(new THREE.CylinderGeometry(.012,.012,.4,10),bronze,[0,0,0],[0,0,Math.PI/2]));
 bit.position.set(-.7,y+.02,.6);bit.rotation.y=.2;g.add(bit);
 const bs=new THREE.Shape();bs.moveTo(0,-.04);bs.lineTo(.5,-.05);bs.lineTo(.8,0);bs.lineTo(.5,.05);bs.lineTo(0,.04);bs.closePath();
 const ak=new THREE.Group();
 ak.add(mk(new THREE.ExtrudeGeometry(bs,{depth:.012,bevelEnabled:false}),bronze,[0,0,0],[-Math.PI/2,0,0]));
 ak.add(mk(new THREE.CylinderGeometry(.02,.02,.22,12),gd,[-.12,.012,0],[0,0,Math.PI/2]));
 ak.add(mk(new THREE.SphereGeometry(.035,14,10),gd,[-.24,.012,0]));
 ak.add(mk(new THREE.BoxGeometry(.02,.018,.16),gd,[0,.012,0]));
 ak.position.set(.3,y,.55);ak.rotation.y=-.25;g.add(ak);
 for(let i=0;i<5;i++)g.add(mk(new THREE.ConeGeometry(.036,.13,3),bronze,[.15+i*.09,y+.025,.1+R()*.15],[0,R()*TAU,-Math.PI/2+ (R()-.5)*.2]));
 return{g,tl:.95,sway:1};
}

/* 2. Бронзовый сакский котёл на конической ножке */
function mCauldron(){
 const g=new THREE.Group(),br=bronzeMat([3,2]);
 const outer=smooth([[0,.52],[.45,.55],[.8,.7],[1.0,.98],[1.04,1.25],[.98,1.52]],36),inner=smooth([[.93,1.55],[.97,1.25],[.93,.98],[.76,.74],[.45,.6],[0,.57]],24);
 g.add(mk(lathe(cat(outer,[V2(1.0,1.58),V2(.965,1.6)],inner),80),br));
 const foot=smooth([[.62,0],[.6,.05],[.5,.3],[.46,.55]],14),footIn=smooth([[.42,.55],[.46,.3],[.56,.05],[.58,0]],14);
 g.add(mk(lathe(cat(foot,footIn),64),br));
 [1.2,1.1].forEach(y=>g.add(mk(new THREE.TorusGeometry(1.045,.028,10,90),br,[0,y,0],[Math.PI/2,0,0])));
 [-1,1].forEach(s=>{
  g.add(mk(new THREE.TorusGeometry(.3,.045,12,36,Math.PI),br,[s*.98,1.55,0],[0,Math.PI/2,0]));
  g.add(mk(new THREE.SphereGeometry(.075,16,12),br,[s*.98,1.87,0]));
  [-1,1].forEach(t=>g.add(mk(new THREE.CylinderGeometry(.055,.05,.08,12),br,[s*.98,1.55,t*.3])));
 });
 return{g,pd:1};
}

/* 3. Каргалинский золотой диадемный венец с бирюзой на бархатном «бюсте» */
function mDiadem(){
 const g=new THREE.Group(),gd=gold([2,2],.3),R0=.95,half=1.3;
 const tex=memo('diaC',()=>cv(1024,256,(x,w,h)=>{x.fillStyle='#e6b658';x.fillRect(0,0,w,h);x.strokeStyle='#8c5f1c';x.fillStyle='#8c5f1c';x.lineWidth=3;
  for(let i=0;i<64;i++){x.beginPath();x.arc(i*16+8,22,4,0,TAU);x.fill();x.beginPath();x.arc(i*16+8,h-16,4,0,TAU);x.fill()}
  for(let i=0;i<8;i++){const cx=i*128+64;x.beginPath();x.arc(cx,128,34,0,TAU);x.stroke();x.beginPath();x.arc(cx,128,20,0,TAU);x.stroke();
   for(let k=0;k<10;k++){const a=k/10*TAU;x.beginPath();x.moveTo(cx+Math.cos(a)*34,128+Math.sin(a)*34);x.lineTo(cx+Math.cos(a)*48,128+Math.sin(a)*48);x.stroke()}
   x.beginPath();x.moveTo(cx+48,128);x.bezierCurveTo(cx+80,70,cx+100,190,cx+128-48,128);x.stroke()}
  grain({getContext:()=>x,width:w,height:h},10)}));
 const pg=new THREE.PlaneGeometry(half*2,1,260,6),p=pg.attributes.position;
 for(let i=0;i<p.count;i++){const px=p.getX(i),v=p.getY(i)+.5,t=px/half,H=(.26+.2*(1-t*t))*(1-Math.pow(Math.abs(t),6))+.03*Math.abs(Math.sin(t*26))*(1-Math.pow(Math.abs(t),6)),a=px/R0;
  p.setXYZ(i,R0*Math.sin(a),v*H,-R0+R0*Math.cos(a))}
 pg.computeVertexNormals();
 g.add(mk(pg,new THREE.MeshStandardMaterial({map:T(tex,{ct:1}),color:0xffffff,metalness:1,roughness:.28,bumpMap:T(hamC(),{lin:1,r:[6,1]}),bumpScale:1,side:THREE.DoubleSide})));
 const place=(t,y,z=0)=>{const a=t*half/R0;return{p:[R0*Math.sin(a)+Math.sin(a)*z,y,-R0+R0*Math.cos(a)+Math.cos(a)*z],a}};
 const turq=new THREE.MeshPhysicalMaterial({color:col(0x2bb5a5),roughness:.18,clearcoat:1,clearcoatRoughness:.08,metalness:0});
 for(let k=-4;k<=4;k++){const t=k*.22,H=(.26+.2*(1-t*t))*(1-Math.pow(Math.abs(t),6)),o=place(t,H*.5,.012);
  g.add(mk(new THREE.SphereGeometry(.055,24,16),turq,o.p,[0,o.a,0],[1,1,.45]));
  g.add(mk(new THREE.TorusGeometry(.06,.011,8,28),gd,o.p,[0,o.a,0]))}
 const gr=new THREE.InstancedMesh(new THREE.SphereGeometry(.013,8,6),gd,120),d=new THREE.Object3D();
 for(let i=0;i<120;i++){const t=-.96+i/119*1.92,o=place(t,i%2?.018:.04,.012);d.position.set(o.p[0],o.p[1],o.p[2]);d.updateMatrix();gr.setMatrixAt(i,d.matrix)}
 g.add(gr);
 for(let k=-5;k<=5;k++){const t=k*.17,o=place(t,0,.005);
  g.add(mk(new THREE.CylinderGeometry(.004,.004,.1,6),gd,[o.p[0],-.05,o.p[2]]));
  g.add(mk(new THREE.SphereGeometry(.04,14,10),gd,[o.p[0],-.14,o.p[2]],[0,o.a,0],[1,2,.45]))}
 const vel=std(0x12171a,1);
 g.add(mk(new THREE.SphereGeometry(.92,56,36),vel,[0,.12,-R0],[0,0,0],[1,1.12,1.02]));
 g.add(mk(new THREE.CylinderGeometry(.36,.46,.9,36),vel,[0,-.95,-R0]));
 return{g,pd:1};
}

/* 4. Китайский фарфор: ваза мэйпин с кобальтовой росписью */
function vaseCanvas(){return cv(1024,1024,(x,W,H)=>{
 x.fillStyle='#f6f4ee';x.fillRect(0,0,W,H);
 const Y=v=>(1-v)*H,B='#1c3f93';
 x.shadowColor='rgba(28,63,147,.55)';x.shadowBlur=4;x.strokeStyle=B;x.fillStyle=B;x.lineCap='round';
 const line=(v,w)=>{x.lineWidth=w;x.beginPath();x.moveTo(0,Y(v));x.lineTo(W,Y(v));x.stroke()};
 line(.05,5);line(.065,2.5);line(.30,5);line(.312,2.5);line(.64,4);line(.70,4);line(.715,2);line(.855,4);
 for(let i=0;i<16;i++){const cx=(i+.5)*W/16;x.lineWidth=3;x.beginPath();x.moveTo(cx,Y(.075));x.bezierCurveTo(cx-34,Y(.12),cx-30,Y(.24),cx,Y(.29));x.bezierCurveTo(cx+30,Y(.24),cx+34,Y(.12),cx,Y(.075));x.stroke();
  x.globalAlpha=.55;x.beginPath();x.moveTo(cx,Y(.12));x.bezierCurveTo(cx-16,Y(.15),cx-14,Y(.22),cx,Y(.26));x.bezierCurveTo(cx+14,Y(.22),cx+16,Y(.15),cx,Y(.12));x.fill();x.globalAlpha=1}
 const Yc=Y(.47);x.lineWidth=5;x.beginPath();for(let u=0;u<=W;u+=4){const yy=Yc+Math.sin(u/W*TAU*4)*46;u?x.lineTo(u,yy):x.moveTo(u,yy)}x.stroke();
 for(let k=0;k<4;k++){const fx=(k+.25)*W/4,fy=Yc-46;x.lineWidth=3;for(let a=0;a<8;a++){const an=a/8*TAU;x.save();x.translate(fx,fy);x.rotate(an);x.beginPath();x.ellipse(0,-34,15,30,0,0,TAU);x.stroke();x.globalAlpha=.35;x.fill();x.globalAlpha=1;x.restore()}
  x.beginPath();x.arc(fx,fy,13,0,TAU);x.fill();
  const lx=(k+.75)*W/4,ly=Yc+46;for(const s of[-1,1]){x.save();x.translate(lx,ly);x.rotate(s*.7);x.beginPath();x.ellipse(0,-26,12,30,0,0,TAU);x.globalAlpha=.6;x.fill();x.globalAlpha=1;x.stroke();x.restore()}}
 for(let i=0;i<16;i++){const cx=(i+.5)*W/16;x.lineWidth=3;x.beginPath();x.arc(cx,Y(.655),16,Math.PI,0);x.arc(cx-12,Y(.665),8,Math.PI,0);x.stroke()}
 for(let i=0;i<24;i++){const cx=(i+.5)*W/24;x.lineWidth=2.5;x.beginPath();x.moveTo(cx-18,Y(.865));x.lineTo(cx,Y(.95));x.lineTo(cx+18,Y(.865));x.stroke();x.globalAlpha=.4;x.fill();x.globalAlpha=1}
 x.shadowBlur=0;
})}
function mVase(){
 const g=new THREE.Group(),Ht=2.3;
 const out=cat(smooth([[0,.02],[.46,0],[.5,.08],[.64,.35],[.84,.8],[.9,1.15],[.82,1.55],[.56,1.82],[.34,1.95],[.3,2.1],[.33,2.22]],70),[V2(.4,2.28),V2(.42,2.3),V2(.36,2.3)]);
 const nOut=out.length,inn=smooth([[.3,2.28],[.25,2.1],[.3,1.9],[.45,1.5],[.4,.9],[.2,.4],[0,.3]],18);
 const geo=lathe(cat(out,inn),96,(j,p)=>j<nOut?Math.max(0,Math.min(1,p.y/Ht)):1);
 const c=vaseCanvas();
 g.add(mk(geo,new THREE.MeshPhysicalMaterial({map:T(c,{ct:1}),color:0xffffff,roughness:.1,metalness:0,clearcoat:1,clearcoatRoughness:.04,side:THREE.DoubleSide})));
 g.add(mk(new THREE.CylinderGeometry(.46,.5,.08,48),std(0xece8de,.2,0,{}),[0,.0,0]));
 return{g,pd:1};
}

/* 5. Тюркское каменное изваяние (балбал) */
function mStone(){
 const g=new THREE.Group(),st=stoneMat(),dk=std(0x34332f,.95);
 const body=new THREE.BoxGeometry(.74,1.55,.4,12,26,8),p=body.attributes.position;
 for(let i=0;i<p.count;i++){const t=(p.getY(i)+.775)/1.55;p.setX(i,p.getX(i)*(1-.2*t));p.setZ(i,p.getZ(i)*(1-.1*t))}
 rough(body,.045,5);g.add(mk(body,st,[0,.775,0]));
 const base=new THREE.BoxGeometry(1.1,.16,.72,8,2,6);rough(base,.03,4);g.add(mk(base,std(0x55534b,.98),[0,-.07,0]));
 g.add(mk(rough(new THREE.SphereGeometry(.27,32,24),.035,6),st,[0,1.8,0],[0,0,0],[1,1.1,.92]));
 g.add(mk(new THREE.BoxGeometry(.34,.04,.06),st,[0,1.88,.225]));
 [-1,1].forEach(s=>{g.add(mk(new THREE.BoxGeometry(.075,.016,.03),dk,[s*.09,1.83,.245],[0,0,s*.12]));g.add(mk(rough(new THREE.SphereGeometry(.05,14,12),.05,8),st,[s*.28,1.8,0],[0,0,0],[.55,1,.8]));g.add(mk(new THREE.TorusGeometry(.025,.006,6,16),std(0xb4a16a,.5,.6),[s*.285,1.73,0]));
  g.add(mk(new THREE.BoxGeometry(.1,.012,.02),dk,[s*.065,1.675,.245],[0,0,-s*.35]))});
 g.add(mk(new THREE.BoxGeometry(.05,.14,.07),st,[0,1.74,.255]));
 g.add(mk(new THREE.SphereGeometry(.285,28,10,0,TAU,0,Math.PI/2),st,[0,1.9,0],[0,0,0],[1.02,.72,.95]));
 g.add(mk(new THREE.TorusGeometry(.285,.025,8,40),st,[0,1.9,0],[Math.PI/2,0,0],[1.02,.95,1]));
 g.add(mk(new THREE.BoxGeometry(.7,.07,.41),st,[0,.75,0]));
 g.add(mk(new THREE.BoxGeometry(.11,.09,.04),st,[0,.75,.21]));
 g.add(mk(new THREE.BoxGeometry(.13,.5,.12),st,[.27,1.02,.17],[0,0,.5]));
 g.add(mk(new THREE.BoxGeometry(.13,.5,.12),st,[-.2,.9,.19],[0,0,-.28]));
 g.add(mk(lathe(smooth([[0,0],[.045,0],[.07,.06],[.095,.12],[.085,.14],[.0,.13]],10),20),st,[.06,1.07,.25]));
 g.add(mk(new THREE.BoxGeometry(.05,.5,.025),st,[-.12,.55,.22],[0,0,.08]));
 g.add(mk(new THREE.BoxGeometry(.16,.03,.03),st,[-.115,.8,.22],[0,0,.08]));
 return{g,pd:1};
}

/* 6. Керамический черепок с процарапанными знаками */
function shardCanvas(bump){return cv(1024,732,(x,W,H)=>{
 if(bump){x.fillStyle='#808080';x.fillRect(0,0,W,H);grain({getContext:()=>x,width:W,height:H},34)}
 else{const b=blotch(W,H,'#b9744a',['#a8633b','#c98458','#9a5632','#d19467','#8c4f2e'],700,6,50,.22);x.drawImage(b,0,0);grain({getContext:()=>x,width:W,height:H},24)}
 x.lineCap='round';x.lineJoin='round';x.strokeStyle=bump?'#000':'rgba(52,26,14,.85)';x.lineWidth=7;
 if(bump){x.shadowColor='rgba(0,0,0,.8)';x.shadowBlur=3}
 let s2=5;const r2=()=>(s2=(s2*16807)%2147483647)/2147483647;
 for(let row=0;row<5;row++){const y=150+row*108;let px=130+r2()*40;
  while(px<W-190){const w=34+r2()*30,k=(r2()*5)|0;x.beginPath();
   if(k==0){x.moveTo(px,y-36);x.lineTo(px,y+36)}else if(k==1){x.moveTo(px,y-36);x.lineTo(px+w,y+36);x.moveTo(px+w,y-36);x.lineTo(px,y+36)}else if(k==2){x.arc(px+w/2,y,w/2,0,TAU)}else if(k==3){x.moveTo(px,y-34);x.lineTo(px+w,y-34);x.lineTo(px+w*.5,y+34)}else{x.moveTo(px,y-30);x.quadraticCurveTo(px+w*1.2,y,px,y+30);x.moveTo(px,y);x.lineTo(px+w,y)}
   x.stroke();px+=w+30+r2()*26}}
 x.shadowBlur=0;
})}
function mShard(){
 const g=new THREE.Group(),sh=new THREE.Shape(),n=16;
 for(let i=0;i<n;i++){const a=i/n*TAU,k=.86+.2*R();const px=Math.cos(a)*1.3*k,py=Math.sin(a)*.9*k;i?sh.lineTo(px,py):sh.moveTo(px,py)}sh.closePath();
 const geo=new THREE.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:2,curveSegments:8});
 const rep=[1/2.8,1/2],mp=T(shardCanvas(0),{r:rep}),bp=T(shardCanvas(1),{lin:1,r:rep});mp.offset.set(.5,.5);bp.offset.set(.5,.5);
 g.add(mk(geo,new THREE.MeshStandardMaterial({map:mp,bumpMap:bp,bumpScale:3,roughness:.93,metalness:0,side:THREE.DoubleSide})));
 return{g,tl:-.12,sway:1};
}

/* 7. Медное иранское блюдо с гравировкой */
function dishCanvas(bump){return cv(1024,1024,(x,W,H)=>{
 if(bump){x.fillStyle='#808080';x.fillRect(0,0,W,H);grain({getContext:()=>x,width:W,height:H},12)}
 else{const b=blotch(W,H,'#b4693f',['#c47b4c','#9a5430','#5f9a82','#4b8a73','#d08a58'],600,8,60,.25);x.drawImage(b,0,0);grain({getContext:()=>x,width:W,height:H},16)}
 const ink=bump?'#000':'#3a2012',Y=v=>(1-v)*H;x.strokeStyle=ink;x.fillStyle=ink;x.lineCap='round';
 const ln=(v,w)=>{x.lineWidth=w;x.beginPath();x.moveTo(0,Y(v));x.lineTo(W,Y(v));x.stroke()};
 ln(.05,4);ln(.065,2);ln(.21,3);ln(.23,3);ln(.46,3);ln(.48,2);ln(.56,3);
 for(let i=0;i<12;i++){const cx=(i+.5)*W/12;x.lineWidth=3;x.beginPath();x.moveTo(cx-34,Y(.09));x.bezierCurveTo(cx-60,Y(.14),cx-10,Y(.2),cx,Y(.14));x.bezierCurveTo(cx+10,Y(.08),cx+60,Y(.2),cx+34,Y(.09));x.stroke();x.beginPath();x.arc(cx,Y(.17),7,0,TAU);x.fill()}
 for(let i=0;i<48;i++){const cx=(i+.5)*W/48,h=(i%3==0?.1:.06);x.lineWidth=4;x.beginPath();x.moveTo(cx,Y(.25));x.lineTo(cx,Y(.25+h*1.8));x.stroke();if(i%3==0){x.beginPath();x.arc(cx,Y(.25+h*1.8),6,0,TAU);x.fill()}}
 for(let i=0;i<12;i++){const cx=(i+.5)*W/12;x.lineWidth=3;x.beginPath();x.moveTo(cx-40,Y(.58));x.lineTo(cx,Y(.9));x.lineTo(cx+40,Y(.58));x.closePath();x.stroke();x.beginPath();x.moveTo(cx-20,Y(.6));x.lineTo(cx,Y(.8));x.lineTo(cx+20,Y(.6));x.stroke()}
})}
function mDish(){
 const g=new THREE.Group(),Rm=1.25;
 const outer=cat(smooth([[0,.0],[.34,0],[.4,.02],[.5,.06],[.85,.17],[1.15,.33],[1.28,.46]],40),[V2(1.32,.5),V2(1.3,.52),V2(1.26,.5)]),nOut=outer.length;
 const inner=smooth([[1.22,.47],[1.1,.34],[.82,.19],[.45,.11],[0,.09]],30);
 const geo=lathe(cat(outer,inner),96,(j,p)=>j<nOut?0:Math.max(0,Math.min(1,1-p.x/Rm)));
 const mp=T(dishCanvas(0),{ct:1}),bp=T(dishCanvas(1),{lin:1,ct:1});
 g.add(mk(geo,new THREE.MeshStandardMaterial({map:mp,bumpMap:bp,bumpScale:2.2,color:0xffffff,metalness:.85,roughness:.34,side:THREE.DoubleSide})));
 return{g,tl:.85,sway:1};
}

/* 8. Қазақ кілемі: шерстяной ковёр с орнаментом «қошқар мүйіз» и бахромой */
function carpetCanvas(){return cv(1024,683,(x,W,H)=>{
 x.fillStyle='#6b120f';x.fillRect(0,0,W,H);
 const band=(m,c,w)=>{x.strokeStyle=c;x.lineWidth=w;x.strokeRect(m,m,W-2*m,H-2*m)};
 band(10,'#e8dcc0',14);band(34,'#16264a',30);band(66,'#d9b36a',6);band(80,'#e8dcc0',4);
 x.fillStyle='#e8dcc0';for(let i=60;i<W-50;i+=44){[34,H-34].forEach(yy=>{x.beginPath();x.moveTo(i,yy-9);x.lineTo(i+9,yy);x.lineTo(i,yy+9);x.lineTo(i-9,yy);x.fill()})}
 for(let j=60;j<H-50;j+=44){[34,W-34].forEach(xx=>{x.beginPath();x.moveTo(xx,j-9);x.lineTo(xx+9,j);x.lineTo(xx,j+9);x.lineTo(xx-9,j);x.fill()})}
 const horn=(cx,cy,s,dir,c)=>{x.strokeStyle=c;x.lineWidth=Math.max(3,s*.18);x.lineCap='round';x.beginPath();for(let i=0;i<=40;i++){const t=i/40,a=t*Math.PI*2.5,r=s*(1-.78*t),px=cx+dir*(s*.7+r*Math.cos(a)),py=cy+r*Math.sin(a);i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()};
 const diamond=(cx,cy,r,c,f)=>{x.beginPath();x.moveTo(cx,cy-r);x.lineTo(cx+r,cy);x.lineTo(cx,cy+r);x.lineTo(cx-r,cy);x.closePath();f?(x.fillStyle=c,x.fill()):(x.strokeStyle=c,x.lineWidth=5,x.stroke())};
 [W/2-300,W/2,W/2+300].forEach((cx,i)=>{const cy=H/2;diamond(cx,cy,150,'#16264a',1);diamond(cx,cy,128,'#e8dcc0',0);diamond(cx,cy,96,i==1?'#c4902f':'#c4572f',1);diamond(cx,cy,60,'#16264a',1);diamond(cx,cy,34,'#e8dcc0',1);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>{horn(cx+q[0]*150,cy+q[1]*72,30,q[0],'#d9b36a')})});
 for(let i=0;i<6;i++){const cx=170+i*(W-340)/5;[150,H-150].forEach(cy=>{diamond(cx,cy,34,'#16264a',1);diamond(cx,cy,18,'#d9b36a',1);horn(cx-34,cy,16,-1,'#e8dcc0');horn(cx+34,cy,16,1,'#e8dcc0')})}
 x.globalAlpha=.08;x.fillStyle='#000';for(let i=0;i<H;i+=3)x.fillRect(0,i,W,1);for(let i=0;i<W;i+=3)x.fillRect(i,0,1,H);x.globalAlpha=1;
 grain({getContext:()=>x,width:W,height:H},22);
})}
function mCarpet(){
 const g=new THREE.Group(),Wd=2.4,Dp=1.6;
 const geo=new THREE.BoxGeometry(Wd,.07,Dp,90,1,60),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);p.setY(i,y+.035*Math.sin(x*2.6+.6)*Math.cos(z*2.0)+.012*Math.sin(x*9)*Math.sin(z*7))}
 geo.computeVertexNormals();
 const pile=memo('pile',()=>grain(cv(32,32,x=>{x.fillStyle='#808080';x.fillRect(0,0,32,32);x.fillStyle='#a8a8a8';for(let i=0;i<8;i++)for(let j=0;j<8;j++)x.fillRect(i*4+1,j*4+1,2,2)}),30));
 g.add(mk(geo,new THREE.MeshStandardMaterial({map:T(carpetCanvas(),{ct:1}),bumpMap:T(pile,{lin:1,r:[96,64]}),bumpScale:.6,roughness:1,metalness:0})));
 const fr=std(0xe8dcc0,1),im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.007,.007,.16,6),fr,2*70),d=new THREE.Object3D();let k=0;
 [-1,1].forEach(s=>{for(let i=0;i<70;i++){const z=-Dp/2+.03+i*(Dp-.06)/69,x0=s*(Wd/2+.07);d.position.set(x0+(R()-.5)*.02,.0+.035*Math.sin(s*Wd/2*2.6+.6)*Math.cos(z*2)*0,z);d.rotation.set(0,0,Math.PI/2+(R()-.5)*.25);d.updateMatrix();im.setMatrixAt(k++,d.matrix)}});
 g.add(im);
 return{g,tl:.95,sway:1};
}

/* 9. Женский костюм: бархатное платье и головной убор саукеле */
function dressCanvas(){return cv(1024,1024,(x,W,H)=>{
 const b=blotch(W,H,'#7d1515',['#6b1010','#8c1c1c','#751313'],600,4,30,.2);x.drawImage(b,0,0);
 const Y=v=>(1-v)*H,G='#d9b36a';x.strokeStyle=G;x.fillStyle=G;x.lineWidth=5;
 const ln=(v,w)=>{x.lineWidth=w;x.beginPath();x.moveTo(0,Y(v));x.lineTo(W,Y(v));x.stroke()};
 x.fillStyle='#1a1210';x.fillRect(0,Y(.12),W,Y(.0)-Y(.12));x.fillStyle=G;
 ln(.125,6);ln(.138,3);ln(.005,6);
 for(let i=0;i<16;i++){const cx=(i+.5)*W/16;x.lineWidth=3;x.beginPath();x.moveTo(cx-24,Y(.01));x.bezierCurveTo(cx-34,Y(.06),cx-6,Y(.1),cx,Y(.06));x.bezierCurveTo(cx+6,Y(.1),cx+34,Y(.06),cx+24,Y(.01));x.stroke();x.beginPath();x.arc(cx,Y(.075),5,0,TAU);x.fill()}
 ln(.70,5);ln(.84,5);for(let i=0;i<32;i++){const cx=(i+.5)*W/32;x.beginPath();x.moveTo(cx,Y(.72));x.lineTo(cx+12,Y(.77));x.lineTo(cx,Y(.82));x.lineTo(cx-12,Y(.77));x.closePath();x.stroke()}
 x.fillRect(0,0,26,H);x.fillRect(W-26,0,26,H);for(let k=0;k<9;k++){x.fillStyle='#1a1210';x.beginPath();x.arc(10,Y(.2+k*.08),6,0,TAU);x.fill()}
 grain({getContext:()=>x,width:W,height:H},16)})}
function sauCanvas(){return cv(512,512,(x,W,H)=>{
 const b=blotch(W,H,'#8a1a1a',['#781414','#9a2020'],300,3,24,.2);x.drawImage(b,0,0);x.strokeStyle='#d9b36a';x.fillStyle='#d9b36a';x.lineWidth=3;
 for(let i=0;i<10;i++){x.beginPath();x.moveTo(0,i*51.2);x.lineTo(W,i*51.2+30);x.stroke();x.beginPath();x.moveTo(0,i*51.2+30);x.lineTo(W,i*51.2);x.stroke()}
 for(let i=0;i<16;i++)for(let j=0;j<10;j++){x.beginPath();x.arc(i*32+16,j*51.2+25,3.4,0,TAU);x.fill()}
 x.fillRect(0,H-46,W,10);x.fillRect(0,H-10,W,10);grain({getContext:()=>x,width:W,height:H},16)})}
function mCostume(){
 const g=new THREE.Group(),Hd=1.65;
 const dp=smooth([[.8,0],[.78,.08],[.62,.5],[.38,.82],[.24,1.02],[.23,1.18],[.27,1.34],[.25,1.5],[.17,1.6],[.07,1.65]],50);
 const dm=new THREE.MeshStandardMaterial({map:T(dressCanvas(),{ct:1}),roughness:.82,metalness:0,side:THREE.DoubleSide});
 g.add(mk(lathe(dp,72,(j,p)=>Math.max(0,Math.min(1,p.y/Hd))),dm));
 const vel=std(0x7d1515,.85),gd=gold([2,2],.3),skin=std(0xe3d8c6,.7);
 [-1,1].forEach(s=>{g.add(limb([s*.24,1.5,0],[s*.34,1.2,.08],.07,.062,vel));g.add(limb([s*.34,1.2,.08],[s*.38,.92,.2],.062,.055,vel));g.add(mk(new THREE.TorusGeometry(.06,.012,8,20),gd,[s*.38,.95,.19],[1.2,0,s*.2]));g.add(mk(new THREE.SphereGeometry(.052,16,12),skin,[s*.385,.87,.215]))});
 g.add(mk(new THREE.CylinderGeometry(.05,.06,.16,20),skin,[0,1.7,0]));
 g.add(mk(new THREE.TorusGeometry(.065,.012,8,24),std(0xf2ece0,.8),[0,1.64,0],[Math.PI/2,0,0]));
 g.add(mk(new THREE.SphereGeometry(.105,32,24),skin,[0,1.83,0],[0,0,0],[.92,1.12,1]));
 g.add(mk(new THREE.ConeGeometry(.016,.05,10),skin,[0,1.82,.105],[Math.PI/2,0,0]));
 const sp=smooth([[.15,1.78],[.15,1.9],[.13,2.1],[.095,2.32],[.055,2.5],[.02,2.62],[0,2.64]],30);
 g.add(mk(lathe(sp,48,(j,p)=>Math.max(0,Math.min(1,(p.y-1.78)/.86))),new THREE.MeshStandardMaterial({map:T(sauCanvas(),{}),roughness:.8,metalness:0,side:THREE.DoubleSide})));
 [[1.82,.155],[2.0,.142],[2.2,.118]].forEach(q=>g.add(mk(new THREE.TorusGeometry(q[1],.013,10,48),gd,[0,q[0],0],[Math.PI/2,0,0])));
 const coral=std(0xd8442f,.35),bi=new THREE.InstancedMesh(new THREE.SphereGeometry(.014,10,8),coral,28),d=new THREE.Object3D();
 for(let i=0;i<28;i++){const a=i/28*TAU;d.position.set(Math.cos(a)*.152,1.92,Math.sin(a)*.152);d.updateMatrix();bi.setMatrixAt(i,d.matrix)}g.add(bi);
 const feather=std(0xf4efe3,.9);for(let i=0;i<14;i++){const a=i/14*TAU,t=.12+R()*.1;g.add(mk(new THREE.ConeGeometry(.012,.28+R()*.1,6),feather,[Math.cos(a)*.03,2.76,Math.sin(a)*.03],[Math.sin(a)*t,0,-Math.cos(a)*t]))}
 const sil=std(0xd9dde0,.25,1),ch=new THREE.InstancedMesh(new THREE.SphereGeometry(.013,10,8),sil,28);let k=0;
 [-1,1].forEach(s=>{for(let i=0;i<14;i++){d.position.set(s*(.158+i*.003),1.82-i*.034,.03);d.updateMatrix();ch.setMatrixAt(k++,d.matrix)}});g.add(ch);
 return{g,pd:1};
}

/* 10. Транзисторный радиоприёмник Sanyo */
function radioCanvas(){return cv(1024,640,(x,W,H)=>{
 const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#cfd2d4');g.addColorStop(.5,'#e8eaeb');g.addColorStop(1,'#b9bdc0');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.globalAlpha=.07;x.fillStyle='#000';for(let i=0;i<H;i+=2)x.fillRect(0,i,W,1);x.globalAlpha=1;
 x.fillStyle='#bfc3c6';x.strokeStyle='#8e9295';x.lineWidth=4;x.fillRect(50,130,500,470);x.strokeRect(50,130,500,470);
 x.fillStyle='#0d0d0e';for(let r=0;r<22;r++)for(let c=0;c<24;c++){x.beginPath();x.arc(70+c*20.5,150+r*20.5,6,0,TAU);x.fill()}
 x.fillStyle='#101214';x.fillRect(560,60,420,200);x.strokeStyle='#777';x.lineWidth=5;x.strokeRect(560,60,420,200);
 x.fillStyle='#f1ebdd';x.strokeStyle='#f1ebdd';x.font='700 22px Arial';x.textAlign='center';
 ['55','70','90','120','160'].forEach((t,i)=>x.fillText(t,600+i*85,110));
 x.lineWidth=2;for(let i=0;i<=40;i++){x.beginPath();x.moveTo(590+i*8.4,128);x.lineTo(590+i*8.4,i%5?142:156);x.stroke()}
 x.fillStyle='#e8c46a';x.font='600 18px Arial';x.fillText('MHz  ·  FM / AM',770,215);
 x.strokeStyle='#d6322a';x.lineWidth=4;x.beginPath();x.moveTo(740,76);x.lineTo(740,170);x.stroke();
 x.fillStyle='#222';x.font='italic 800 68px Arial';x.textAlign='left';x.fillText('SANYO',60,100);
 x.fillStyle='#555';x.font='600 20px Arial';x.fillText('TRANSISTOR 6',330,92);
 [[770,430],[900,530]].forEach(q=>{x.fillStyle='#9fa3a6';x.beginPath();x.arc(q[0],q[1],62,0,TAU);x.fill();x.strokeStyle='#6c7073';x.lineWidth=4;x.stroke()});
 x.fillStyle='#333';x.font='700 18px Arial';x.textAlign='center';x.fillText('VOLUME',770,525);x.fillText('TUNING',900,620);
})}
function mRadio(){
 const g=new THREE.Group(),W=1.9,H=1.15,D=.5;
 const body=new THREE.MeshPhysicalMaterial({color:col(0x4a2e1f),roughness:.45,metalness:0,clearcoat:.5,clearcoatRoughness:.25});
 const bg=new THREE.ExtrudeGeometry(rrect(W,H,.14),{depth:D,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:5,curveSegments:16});bg.translate(0,0,-D/2);
 g.add(mk(bg,body));
 const fc=memo('radioFront',radioCanvas);
 g.add(mk(new THREE.PlaneGeometry(W-.06,H-.06),new THREE.MeshStandardMaterial({map:T(fc,{ct:1}),bumpMap:T(fc,{lin:1,ct:1}),bumpScale:1.2,roughness:.38,metalness:.55}),[0,0,D/2+.052]));
 g.add(mk(new THREE.PlaneGeometry(.755,.34),new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.16,roughness:.05,metalness:0,clearcoat:1}),[.464,.2725,D/2+.058]));
 const kn=smooth([[.0,0],[.11,0],[.12,.03],[.115,.1],[.1,.13],[0,.13]],14),dkp=std(0x1a1a1a,.4),ch=chrome();
 [[.464,-.1875],[.697,-.357]].forEach(q=>{g.add(mk(lathe(kn,40),dkp,[q[0],q[1],D/2+.052],[Math.PI/2,0,0]));g.add(mk(new THREE.CylinderGeometry(.07,.07,.012,28),ch,[q[0],q[1],D/2+.052+.132],[Math.PI/2,0,0]))});
 g.add(mk(new THREE.TorusGeometry(.5,.03,10,36,Math.PI),std(0x1b1410,.5),[0,H/2+.03,0]));
 const ant=new THREE.Group();let y=0;[.32,.3,.28,.26,.24].forEach((len,i)=>{ant.add(mk(new THREE.CylinderGeometry(.007+(4-i)*.002,.009+(4-i)*.002,len,10),ch,[0,y+len/2,0]));y+=len});
 ant.add(mk(new THREE.SphereGeometry(.016,12,10),ch,[0,y,0]));
 ant.position.set(-.78,H/2+.04,-.1);ant.rotation.set(-.15,0,.35);g.add(ant);
 return{g,pd:1};
}

const MODELS=[mGolden,mWeapons,mCauldron,mDiadem,mVase,mStone,mShard,mDish,mCarpet,mCostume,mRadio];

/* =========================================================
   ДОПОЛНИТЕЛЬНЫЕ ДАННЫЕ ОБ ЭКСПОНАТАХ
   ========================================================= */
const X=[
{fact:"Иссыкский курган находится в Алматинской области, совсем недалеко от города, где расположен музей.",look:"Золотые бляшки на кафтане и высокий головной убор."},
{fact:"Бронзовые наконечники стрел отливали в формах, поэтому воины получали одинаковые стрелы в большом количестве.",look:"Копьё, стрелы, удила и кинжал на бархатной подложке."},
{fact:"Сакские котлы отливали из бронзы. На конической ножке такой сосуд стоял устойчиво.",look:"Зелёный налёт патины на старой бронзе и массивные ручки."},
{fact:"Каргалинский клад найден в ущелье недалеко от Алматы.",look:"Бирюзовые вставки и золотые подвески по краю венца."},
{fact:"Фарфор — один из символов торговли по Великому Шёлковому пути.",look:"Кобальтовая роспись: цветы, волны и орнаментальные пояса."},
{fact:"Изваяния ставили вертикально. На них обычно показаны лицо, руки с сосудом и пояс.",look:"Черты лица, руки и сосуд, высеченные в камне."},
{fact:"Знаки на черепках — часть истории письменности Южного Казахстана.",look:"Процарапанные знаки в несколько рядов на глине."},
{fact:"Медные блюда украшали гравировкой: поясами орнамента и растительными мотивами.",look:"Концентрические пояса гравировки и тёплый блеск меди."},
{fact:"Орнамент «қошқар мүйіз» — это стилизованные бараньи рога.",look:"Ромбы в центре, рамка из орнамента и бахрома по краям."},
{fact:"Саукеле — высокий праздничный головной убор невесты с вышивкой и украшениями.",look:"Расшитое золотом платье и высокое саукеле с перьями."},
{fact:"Транзисторные приёмники сделали радио переносным: его можно было взять с собой.",look:"Шкала настройки и две ручки: громкость и поиск станции."}
];
E.forEach((e,i)=>Object.assign(e,X[i]||{}));

/* =========================================================
   3D: СЦЕНА ЭКСПОНАТА (постамент, пол, свет, пылинки)
   ========================================================= */
const LIGHTS={
 museum:{n:"Музей",key:[0xfff0d8,2.1],rim:[0x7fd0dc,.9],fill:[0xffd9a8,.35],hemi:[0xdfeaff,.3],exp:1.05},
 warm:{n:"Тёплый",key:[0xffc27a,2.4],rim:[0xff8a4c,.8],fill:[0xffb070,.5],hemi:[0xffe2b8,.35],exp:1.1},
 cool:{n:"Холодный",key:[0xcfe3ff,2.0],rim:[0x8fb4ff,1.1],fill:[0x9fc0ff,.4],hemi:[0xcfe0ff,.4],exp:1.0},
 drama:{n:"Контраст",key:[0xfff4e0,3.0],rim:[0xc89a45,1.7],fill:[0x000000,0],hemi:[0x223038,.08],exp:1.0}
};
const LKEYS=Object.keys(LIGHTS);
let lightMode=0,ENV=null,RN=null;
function applyLight(S,k){const L=LIGHTS[k];S.key.color.setHex(L.key[0]);S.key.intensity=L.key[1];S.rim.color.setHex(L.rim[0]);S.rim.intensity=L.rim[1];S.fill.color.setHex(L.fill[0]);S.fill.intensity=L.fill[1];S.hemi.color.setHex(L.hemi[0]);S.hemi.intensity=L.hemi[1];if(RN)RN.toneMappingExposure=L.exp}

const SC={};
function mkScene(i){
 if(SC[i])return SC[i];
 let b;try{b=MODELS[i]()}catch(err){console.error('Модель',i,err);b={g:new THREE.Group()};b.g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1,2),new THREE.MeshStandardMaterial({color:0xc89a45,metalness:.8,roughness:.3})))}
 const obj=b.g,sc=new THREE.Scene(),piv=new THREE.Group(),grp=new THREE.Group();
 obj.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
 const bx=new THREE.Box3().setFromObject(obj),sz=bx.getSize(new THREE.Vector3()),ce=bx.getCenter(new THREE.Vector3());
 obj.position.sub(ce);grp.add(obj);grp.scale.setScalar(2.5/Math.max(sz.x,sz.y,sz.z));grp.rotation.x=b.tl||0;piv.add(grp);sc.add(piv);
 piv.updateMatrixWorld(true);
 const b2=new THREE.Box3().setFromObject(grp),s2=b2.getSize(new THREE.Vector3()),yy=b2.min.y;
 const goldM=()=>new THREE.MeshStandardMaterial({color:new THREE.Color(1,.77,.33),metalness:1,roughness:.25});
 let fy;
 if(b.pd){
  const rad=Math.max(.55,Math.hypot(s2.x,s2.z)/2*.95+.18);
  const dark=new THREE.MeshStandardMaterial({color:col(0x1d2224),roughness:.3,metalness:.3});
  const pl=mk(new THREE.CylinderGeometry(rad,rad*1.05,.14,80),dark,[0,yy-.07,0]);pl.receiveShadow=true;pl.castShadow=true;piv.add(pl);
  const pl2=mk(new THREE.CylinderGeometry(rad*1.2,rad*1.24,.1,80),dark,[0,yy-.19,0]);pl2.receiveShadow=true;pl2.castShadow=true;piv.add(pl2);
  piv.add(mk(new THREE.TorusGeometry(rad*1.01,.014,8,90),goldM(),[0,yy+.002,0],[Math.PI/2,0,0]));
  piv.add(mk(new THREE.TorusGeometry(rad*1.22,.01,8,90),goldM(),[0,yy-.139,0],[Math.PI/2,0,0]));
  fy=yy-.25;
 }else fy=yy-.55;
 /* отражающий пол */
 const ft=memo('floorT',()=>cv(512,512,(x,w,h)=>{const g=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(48,60,63,1)');g.addColorStop(.55,'rgba(20,27,29,.95)');g.addColorStop(1,'rgba(10,13,14,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}));
 const ftex=new THREE.CanvasTexture(ft);ftex.encoding=THREE.sRGBEncoding;
 const floor=mk(new THREE.CircleGeometry(3.4,72),new THREE.MeshStandardMaterial({map:ftex,transparent:true,roughness:.28,metalness:.7}),[0,fy,0],[-Math.PI/2,0,0]);floor.receiveShadow=true;sc.add(floor);
 const gr=new THREE.MeshBasicMaterial({color:0xc89a45,transparent:true,opacity:.55,side:THREE.DoubleSide});
 [[1.75,1.78,.55],[2.55,2.57,.25]].forEach(q=>{const m=new THREE.MeshBasicMaterial({color:0xc89a45,transparent:true,opacity:q[2],side:THREE.DoubleSide});sc.add(mk(new THREE.RingGeometry(q[0],q[1],96),m,[0,fy+.003,0],[-Math.PI/2,0,0]))});
 /* пылинки в луче света */
 const N=70,pos=new Float32Array(N*3),spd=new Float32Array(N),ph=new Float32Array(N);
 for(let k=0;k<N;k++){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*2.4;pos[k*3]=Math.cos(a)*r;pos[k*3+1]=fy+Math.random()*4.2;pos[k*3+2]=Math.sin(a)*r;spd[k]=.05+Math.random()*.12;ph[k]=Math.random()*TAU}
 const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(pos,3));
 const dtex=new THREE.CanvasTexture(cv(32,32,(x,w,h)=>{const g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,236,190,1)');g.addColorStop(1,'rgba(255,236,190,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}));
 const dust=new THREE.Points(dg,new THREE.PointsMaterial({map:dtex,size:.07,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}));
 dust.frustumCulled=false;sc.add(dust);
 /* свет */
 const hemi=new THREE.HemisphereLight(0xdfeaff,0x3a2a1a,.3);sc.add(hemi);
 const key=new THREE.DirectionalLight(0xfff0d8,2.1);key.position.set(3,5,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);const c=key.shadow.camera;c.left=c.bottom=-3.4;c.right=c.top=3.4;c.near=.5;c.far=16;key.shadow.bias=-.0004;key.shadow.normalBias=.02;key.shadow.radius=3;sc.add(key);
 const rim=new THREE.DirectionalLight(0x7fd0dc,.9);rim.position.set(-4,2,-3);sc.add(rim);
 const fill=new THREE.PointLight(0xffd9a8,.35,12);fill.position.set(-2.5,1.2,3.5);sc.add(fill);
 if(ENV)sc.environment=ENV;
 const S={sc,piv,sway:b.sway,tl:b.tl||0,key,rim,fill,hemi,dust:{pos,spd,ph,dg,N,fy},wire:false,mats:[]};
 obj.traverse(o=>{if(o.isMesh)S.mats.push(o.material)});
 applyLight(S,LKEYS[lightMode]);
 return SC[i]=S;
}
function setWire(S,on){S.wire=on;S.mats.forEach(m=>{(Array.isArray(m)?m:[m]).forEach(mm=>{mm.wireframe=on;mm.needsUpdate=true})})}

/* =========================================================
   3D: ВЬЮЕР (один рендерер на весь сайт)
   ========================================================= */
function Viewer(box){
 const r=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'}),cam=new THREE.PerspectiveCamera(32,1,.1,60),el=r.domElement;
 RN=r;r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
 ENV=makeEnv(r);
 r.setPixelRatio(Math.min(devicePixelRatio,2));box.prepend(el);el.style.touchAction='none';
 let S=null,cur=-1,zoom=7,tz=7,userAuto=true,auto=true,drag=false,lx=0,ly=0,vx=0,vy=0,idle=0,t=0,last=performance.now(),pd=0,lost=false;
 const ptr=new Map(),rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
 function size(){const w=box.clientWidth,h=box.clientHeight;if(!w||!h)return;r.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix()}
 new ResizeObserver(size).observe(box);
 el.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true});
 el.addEventListener('webglcontextrestored',()=>{lost=false;size()});
 el.onpointerdown=e=>{ptr.set(e.pointerId,[e.clientX,e.clientY]);try{el.setPointerCapture(e.pointerId)}catch(_){}drag=true;auto=false;vx=vy=0;lx=e.clientX;ly=e.clientY;if(ptr.size==2){const a=[...ptr.values()];pd=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])}};
 el.onpointermove=e=>{if(!ptr.has(e.pointerId))return;ptr.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptr.size==2){const a=[...ptr.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);tz=Math.max(4,Math.min(11,tz-(d-pd)*.02));pd=d;return}
  if(!drag||!S)return;vx=(e.clientX-lx)*.01;vy=(e.clientY-ly)*.01;S.piv.rotation.y+=vx;S.piv.rotation.x=Math.max(-.9,Math.min(.9,S.piv.rotation.x+vy));lx=e.clientX;ly=e.clientY};
 const up=e=>{ptr.delete(e.pointerId);if(!ptr.size){drag=false;idle=240}};el.onpointerup=up;el.onpointercancel=up;
 el.onwheel=e=>{e.preventDefault();e.stopPropagation();tz=Math.max(4,Math.min(11,tz+e.deltaY*.005))};
 const reset=()=>{if(S){S.piv.rotation.set(0,S.sway?-.3:0,0);tz=7;vx=vy=0;auto=true}};
 el.ondblclick=reset;
 (function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000||0);last=now;if(!S||lost||document.hidden||!box.offsetParent)return;t+=dt;
  if(!drag){S.piv.rotation.y+=vx;S.piv.rotation.x=Math.max(-.9,Math.min(.9,S.piv.rotation.x+vy));vx*=.93;vy*=.93;if(!auto&&userAuto&&--idle<=0)auto=true;
   if(auto&&userAuto&&!rm){if(S.sway)S.piv.rotation.y+=Math.cos(t*.5)*.3*dt;else S.piv.rotation.y+=.45*dt;S.piv.rotation.x*=.98}}
  const d=S.dust,p=d.pos;if(!rm){for(let k=0;k<d.N;k++){p[k*3+1]+=d.spd[k]*dt;p[k*3]+=Math.sin(t*.4+d.ph[k])*.003;if(p[k*3+1]>d.fy+4.2)p[k*3+1]=d.fy}d.dg.attributes.position.needsUpdate=true}
  zoom+=(tz-zoom)*.12;cam.position.set(0,zoom*.16,zoom);cam.lookAt(0,-.1,0);r.render(S.sc,cam)})(performance.now());
 return{
  el,
  get current(){return cur},
  set(i){cur=i;S=mkScene(i);S.sc.environment=ENV;applyLight(S,LKEYS[lightMode]);auto=true;vx=vy=0;tz=zoom=7;S.piv.rotation.set(0,S.sway?-.3:0,0);size()},
  reset,
  zoomBy(k){tz=Math.max(4,Math.min(11,tz+k))},
  toggleAuto(){userAuto=!userAuto;auto=userAuto;return userAuto},
  toggleWire(){if(!S)return false;setWire(S,!S.wire);return S.wire},
  get wire(){return !!(S&&S.wire)},
  get auto(){return userAuto},
  cycleLight(){lightMode=(lightMode+1)%LKEYS.length;if(S)applyLight(S,LKEYS[lightMode]);return LIGHTS[LKEYS[lightMode]].n},
  get lightName(){return LIGHTS[LKEYS[lightMode]].n},
  shot(name){if(!S)return;const w=el.width,h=el.height;r.render(S.sc,cam);const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),g=x.createRadialGradient(w/2,h*.6,0,w/2,h*.6,Math.max(w,h)*.7);g.addColorStop(0,'#2b3536');g.addColorStop(.62,'#121819');g.addColorStop(1,'#0a0d0e');x.fillStyle=g;x.fillRect(0,0,w,h);x.drawImage(el,0,0);
   x.fillStyle='rgba(236,202,133,.85)';x.font=`600 ${Math.round(w/34)}px Georgia,serif`;x.fillText(name+' · Музей РК',w/28,h-h/28);
   c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(name||'exhibit').replace(/[^\wа-яё]+/gi,'_')+'.png';document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)},'image/png')},
  thumb(i){const T=mkScene(i),pr=r.getPixelRatio(),sv=T.piv.rotation.clone(),cc=new THREE.PerspectiveCamera(32,4/3,.1,60);
   cc.position.set(0,1.15,7.2);cc.lookAt(0,-.1,0);r.setPixelRatio(1);r.setSize(480,360,false);T.sc.environment=ENV;T.piv.rotation.set(0,-.6,0);r.render(T.sc,cc);
   const url=el.toDataURL('image/png');T.piv.rotation.copy(sv);r.setPixelRatio(Math.min(devicePixelRatio,2));size();return url}
 }}

/* =========================================================
   СБОРКА СЛАЙДОВ
   ========================================================= */
const CATS=[...new Set(E.map(x=>x.c))];
E.forEach((x,i)=>{const s=document.createElement('section');s.className='slide'+(i%2?'':' alt');s.dataset.t=x.n;s.dataset.ex=i;
 const prevLbl=i==0?'К коллекции':E[i-1].n,nextLbl=i==E.length-1?'К итогам':E[i+1].n;
 s.innerHTML=`<div class="two ex"><div><div class="n">Экспонат ${i+1} из ${E.length}</div><h2>${x.n}</h2><div class="tags"><span>${x.e}</span><span>${x.c}</span><span>${x.mt}</span></div><p>${x.d}</p>
 <div class="fact"><b>Знаете ли вы?</b>${x.fact}</div><div class="look"><b>Что рассмотреть:</b> ${x.look}</div>
 <div class="pn"><button class="btn ghost" ${i==0?'data-goid="over"':`data-goex="${i-1}"`}>← ${prevLbl}</button><button class="btn" ${i==E.length-1?'data-goid="themes"':`data-goex="${i+1}"`}>${nextLbl} →</button></div>
 <div class="mini">${E.map((y,k)=>`<button class="${k==i?'on':''}" data-goex="${k}" title="${y.n}" aria-label="${y.n}">${k+1}</button>`).join('')}</div></div>
 <div class="slot" data-m="${i}"><small>Вращайте мышью · колесо — масштаб · двойной клик — сброс</small></div></div>`;
 $('#themes').before(s)});
$('#ov').innerHTML=E.map((x,i)=>`<button class="th" data-goex="${i}" data-c="${x.c}" data-s="${(x.n+' '+x.e+' '+x.c+' '+x.mt).toLowerCase()}"><img alt="${x.n}" src=""><span><em>${String(i+1).padStart(2,'0')} · ${x.c}</em>${x.n}</span></button>`).join("");
$('#flt').innerHTML=['Все',...CATS].map((c,k)=>`<button class="chip${k?'':' on'}" data-c="${k?c:''}">${c}</button>`).join('');
$('#cats').innerHTML=CATS.map(c=>`<div class="hall"><h3>${c}</h3><ul class="cl">${E.map((x,i)=>x.c==c?`<li><button data-goex="${i}">${x.n}<span>${x.e}</span></button></li>`:'').join('')}</ul></div>`).join('');
$('#tm').innerHTML=TEAM.map(t=>`<div class="person"><i>${t[0].trim().charAt(0)}</i><h3>${t[0]}</h3><p>${t[1]}</p></div>`).join("");
const slides=$$('.slide');
const idxOf=id=>slides.findIndex(s=>s.id===id);
const exIdx=i=>slides.findIndex(s=>s.dataset.ex==i);
const dots=$('#dots');slides.forEach((s,i)=>{const b=document.createElement('button');b.className='dot';b.title=s.dataset.t;b.setAttribute('aria-label',s.dataset.t);b.onclick=()=>go(i);dots.append(b)});
slides.forEach(s=>{let k=0;s.querySelectorAll('h1,h2,.eyebrow,.sub,.lede,.hbtns,.stats,.steps li,.th,.hall,.person,.film,.slot,.n,.tags,.ex p,.ex .fact,.look,.pn,.mini,.qr,.board,.flt,.search').forEach(el=>{el.classList.add('rv');el.style.setProperty('--i',k++)})});

/* фильтр коллекции */
let fCat='',fQ='';
function filt(){let n=0;$$('#ov .th').forEach(b=>{const ok=(!fCat||b.dataset.c===fCat)&&(!fQ||b.dataset.s.includes(fQ));b.hidden=!ok;if(ok)n++});$('#ovn').textContent=n?`Показано: ${n} из ${E.length}`:'Ничего не найдено. Попробуйте другое слово.'}
$('#flt').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;fCat=b.dataset.c;$$('#flt .chip').forEach(x=>x.classList.toggle('on',x===b));filt()});
$('#sq').addEventListener('input',e=>{fQ=e.target.value.trim().toLowerCase();filt()});filt();

/* =========================================================
   3D-ПАНЕЛЬ ИНСТРУМЕНТОВ
   ========================================================= */
let idx=0,lock=false;
const vb=document.createElement('div');vb.className='vb';
const tools=document.createElement('div');tools.className='tools';
tools.innerHTML=`<button data-a="auto" class="on" title="Автовращение (A)" aria-label="Автовращение">⟳</button><button data-a="wire" title="Каркас (W)" aria-label="Каркас">◫</button><button data-a="light" title="Освещение (L)" aria-label="Освещение">☀</button><button data-a="zin" title="Приблизить" aria-label="Приблизить">＋</button><button data-a="zout" title="Отдалить" aria-label="Отдалить">－</button><button data-a="reset" title="Сбросить вид (R)" aria-label="Сбросить вид">⌂</button><button data-a="shot" title="Сохранить снимок" aria-label="Сохранить снимок">⤓</button><button data-a="full" title="Во весь экран" aria-label="Во весь экран">⤢</button><span class="lt" aria-live="polite"></span>`;
let V=null;
if(window.THREE){try{V=Viewer(vb)}catch(err){console.error('WebGL недоступен',err)}}
if(!V)$$('.slot').forEach(s=>{const m=document.createElement('div');m.className='nogl';m.textContent=window.THREE?'WebGL недоступен в этом браузере. Попробуйте Chrome, Edge или Safari.':'Не удалось загрузить 3D-библиотеку. Проверьте интернет и обновите страницу.';s.prepend(m)});
function toast(t){const l=tools.querySelector('.lt');l.textContent=t;l.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>l.classList.remove('on'),1400)}
function act(a){if(!V)return;const sl=slides[idx],slot=sl&&sl.querySelector('.slot');
 if(a=='auto'){const on=V.toggleAuto();tools.querySelector('[data-a=auto]').classList.toggle('on',on);toast(on?'Автовращение включено':'Автовращение выключено')}
 else if(a=='wire'){const on=V.toggleWire();tools.querySelector('[data-a=wire]').classList.toggle('on',on);toast(on?'Каркас':'Сплошная модель')}
 else if(a=='light')toast('Свет: '+V.cycleLight());
 else if(a=='zin')V.zoomBy(-1);else if(a=='zout')V.zoomBy(1);
 else if(a=='reset'){V.reset();toast('Вид сброшен')}
 else if(a=='shot'){const x=E[+(slot&&slot.dataset.m)];V.shot(x?x.n:'экспонат');toast('Снимок сохранён')}
 else if(a=='full'&&slot){document.fullscreenElement===slot?document.exitFullscreen():slot.requestFullscreen&&slot.requestFullscreen().catch(()=>{})}}
tools.addEventListener('click',e=>{const b=e.target.closest('button');if(b){e.stopPropagation();act(b.dataset.a)}});
tools.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});

/* =========================================================
   НАВИГАЦИЯ
   ========================================================= */
let tour=null;
const tourBtn=$('#tb');
function stopTour(){if(tour){clearTimeout(tour);tour=null}tourBtn.classList.remove('on');tourBtn.textContent='▶ Экскурсия'}
function tourNext(){tour=setTimeout(()=>{if(idx>=slides.length-1||['vid','game'].includes(slides[idx+1]&&slides[idx+1].id))return stopTour();go(idx+1,false,true);tourNext()},slides[idx].dataset.ex!==undefined?12000:8000)}
function startTour(){if(tour)return stopTour();if(idx<3)go(exIdx(0),false,true);tourBtn.classList.add('on');tourBtn.textContent='❚❚ Пауза';tourNext()}
tourBtn.onclick=startTour;

function go(n,force,fromTour){n=Math.max(0,Math.min(slides.length-1,n));if(!fromTour&&tour)stopTour();if(n===idx&&!force)return;idx=n;lock=true;setTimeout(()=>lock=false,800);
 $('#tr').style.transform=`translate3d(0,${-idx*100}%,0)`;
 slides.forEach((s,i)=>{s.classList.toggle('on',i===idx)});
 document.body.classList.toggle('light',slides[idx].classList.contains('alt'));
 [...dots.children].forEach((d,i)=>d.classList.toggle('on',i===idx));
 $('#ct').innerHTML=`<b>${idx+1}</b> / ${slides.length} · ${slides[idx].dataset.t}`;$('#pg').style.width=(idx+1)/slides.length*100+'%';
 try{history.replaceState(null,'','#'+(idx+1))}catch(_){}
 document.title=slides[idx].dataset.t+' — Музей РК · 3D-презентация';
 const slot=slides[idx].querySelector('.slot');
 if(slot&&V){slot.append(vb,tools);const m=+slot.dataset.m;V.set(m);tools.querySelector('[data-a=wire]').classList.remove('on');tools.querySelector('[data-a=auto]').classList.toggle('on',V.auto)}
 if(slides[idx].id==='game')renderBoard();
 slides.forEach((sl,i)=>{if(!sl.dataset.n)sl.dataset.n=String(i+1).padStart(2,'0')})}
function canScroll(el,dir){const s=el.closest&&el.closest('.slide');if(!s||s.scrollHeight<=s.clientHeight+4)return false;return dir>0?s.scrollTop+s.clientHeight<s.scrollHeight-4:s.scrollTop>4}
const modalOpen=()=>!$('#gm').hidden||!$('#help').hidden;
addEventListener('wheel',e=>{if(modalOpen())return;if(canScroll(e.target,e.deltaY))return;e.preventDefault();if(lock||Math.abs(e.deltaY)<10)return;go(idx+(e.deltaY>0?1:-1))},{passive:false});
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key;
 if(!$('#help').hidden){if(k=='Escape'||k=='?'||k=='h'||k=='H')toggleHelp(false);return}
 if(!$('#gm').hidden){if(k=='Escape')closeGame();return}
 if(['ArrowRight','ArrowDown','PageDown',' '].includes(k)){e.preventDefault();go(idx+1)}else if(['ArrowLeft','ArrowUp','PageUp'].includes(k)){e.preventDefault();go(idx-1)}
 else if(k=='Home')go(0);else if(k=='End')go(slides.length-1);
 else if(k=='f'||k=='F')fs();else if(k=='t'||k=='T'||k=='е'||k=='Е')startTour();
 else if(k=='?'||k=='h'||k=='H')toggleHelp(true);
 else if(slides[idx].querySelector('.slot')){const m={a:'auto',ф:'auto',w:'wire',ц:'wire',l:'light',д:'light',r:'reset',к:'reset'}[k.toLowerCase()];if(m)act(m)}});
let tx=0,ty=0;addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
addEventListener('touchend',e=>{if(modalOpen())return;if(e.target.closest&&e.target.closest('.vb,.tools,.film,.mini,.flt,input'))return;const dy=ty-e.changedTouches[0].clientY,dx=tx-e.changedTouches[0].clientX;
 if(Math.abs(dy)>50&&Math.abs(dy)>Math.abs(dx)&&!canScroll(e.target,dy))go(idx+(dy>0?1:-1));else if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)go(idx+(dx>0?1:-1))},{passive:true});
document.addEventListener('click',e=>{const b=e.target.closest('[data-go],[data-goid],[data-goex]');if(!b)return;
 if(b.dataset.go)go(+b.dataset.go-1);else if(b.dataset.goid){const n=idxOf(b.dataset.goid);if(n>=0)go(n)}else if(b.dataset.goex!==undefined){const n=exIdx(+b.dataset.goex);if(n>=0)go(n)}});
addEventListener('hashchange',()=>{const n=(parseInt(location.hash.slice(1))||1)-1;if(n!==idx)go(n)});
$('#pv').onclick=()=>go(idx-1);$('#nx').onclick=()=>go(idx+1);
function fs(){const d=document;d.fullscreenElement?d.exitFullscreen():d.documentElement.requestFullscreen&&d.documentElement.requestFullscreen().catch(()=>{})}$('#fs').onclick=fs;
document.addEventListener('fullscreenchange',()=>{$('#fs').textContent=document.fullscreenElement===document.documentElement?'Выйти':'На весь экран'});
function toggleHelp(on){$('#help').hidden=!on}
$('#hb').onclick=()=>toggleHelp(true);$('#hx').onclick=()=>toggleHelp(false);$('#help').addEventListener('click',e=>{if(e.target.id==='help')toggleHelp(false)});

/* =========================================================
   ИГРА / QR / ТАБЛИЦА РЕЗУЛЬТАТОВ
   ========================================================= */
const GAME_LINK=GAME_URL||(/^https?:$/.test(location.protocol)?new URL('game.html',location.href).href:'');
if(GAME_LINK){$('#fu').textContent=GAME_LINK.replace(/^https?:\/\//,'');
 if(window.QRCode){$('#qr').textContent="";try{new QRCode($('#qr'),{text:GAME_LINK,width:160,height:160,colorDark:'#0f1b24',colorLight:'#f1ebdd'})}catch(_){$('#qr').textContent='Не удалось создать QR'}}
 $('#cp').onclick=async()=>{try{await navigator.clipboard.writeText(GAME_LINK);$('#cp').textContent='Скопировано ✓'}catch(_){prompt('Скопируйте ссылку:',GAME_LINK)}setTimeout(()=>$('#cp').textContent='Копировать ссылку',1800)}}
else{$('#fu').textContent='Выложите сайт в интернет (GitHub Pages, Netlify) — QR-код появится сам. Или вставьте ссылку в GAME_URL в начале script.js.';$('#cp').style.display='none'}
const bget=()=>{try{return JSON.parse(localStorage.getItem('museumQuizBoard'))||[]}catch(e){return[]}};
const esc=s=>String(s).replace(/[<>&"']/g,'');
function renderBoard(){const b=bget().slice(0,6),max=Math.max(1,...b.map(x=>x.score));
 $('#rs').innerHTML=b.length?b.map((x,i)=>`<div class="opt" style="--w:${x.score/max*100}%"><span>${i+1}. ${esc(x.name)}</span><span>${x.score}</span></div>`).join(''):'<div class="opt" style="--w:0%"><span>Пока никто не играл — станьте первым!</span></div>';
 $('#ps').textContent=b.length?'Результаты игр на этом устройстве.':'Нажмите «Играть на экране» или отсканируйте QR-код.'}
function openGame(){stopTour();$('#gf').src='game.html?embed=1';$('#gm').hidden=false;$('#gx').focus()}
function closeGame(){$('#gm').hidden=true;$('#gf').src='about:blank';renderBoard()}
$('#fl').onclick=openGame;$('#gx').onclick=closeGame;
addEventListener('message',e=>{if(e.origin!==location.origin&&location.origin!=='null'&&e.origin!=='null')return;const d=e.data&&e.data.quizScore;if(!d||typeof d.score!=='number'||typeof d.name!=='string')return;
 const b=bget();if(!b.some(x=>x.t===d.t&&x.name===d.name.slice(0,16)))b.push({name:d.name.slice(0,16),score:d.score,right:d.right|0,t:d.t});b.sort((x,y)=>y.score-x.score);try{localStorage.setItem('museumQuizBoard',JSON.stringify(b.slice(0,20)))}catch(_){}renderBoard()});
addEventListener('storage',renderBoard);
renderBoard();

/* =========================================================
   ЗАПУСК
   ========================================================= */
const heroVideo=$('video');
if(heroVideo){const source=heroVideo.querySelector('source');const bad=()=>{heroVideo.remove()};if(source)source.addEventListener('error',bad);heroVideo.addEventListener('error',bad);const p=heroVideo.play&&heroVideo.play();if(p&&p.catch)p.catch(()=>{})}
go(Math.max(0,Math.min(slides.length-1,(parseInt(location.hash.slice(1))||1)-1)),true);
const ld=$('#ld'),hideLd=()=>{ld.classList.add('off');setTimeout(()=>ld.remove(),700)};
if(V){let k=0;const step=()=>{if(k>=E.length)return hideLd();try{const u=V.thumb(k);const im=$$('#ov img')[k];if(im)im.src=u}catch(err){console.error('Превью '+k,err)}k++;$('#ldt').textContent=`Готовим экспонаты: ${k} из ${E.length}`;setTimeout(step,20)};
 setTimeout(step,150);setTimeout(hideLd,15000)}else hideLd();
addEventListener('pointermove',e=>{const st=document.documentElement.style;st.setProperty('--mx',e.clientX+'px');st.setProperty('--my',e.clientY+'px')},{passive:true});
