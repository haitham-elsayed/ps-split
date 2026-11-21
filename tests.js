// اختبارات محرك الحساب ومنطق الواجهة بدون متصفح (محاكاة بسيطة للصفحة).
// التشغيل:  node tests.js [مسار-الملف]   (الافتراضي ./index.html)
const fs=require('fs');
const file=process.argv[2]||'./index.html';
const html=fs.readFileSync(file,'utf8');
const code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
let pass=0,fail=0;
const ok=(n,c,d)=>{if(c){pass++;console.log('PASS',n)}else{fail++;console.log('FAIL',n,d===undefined?'':'→ '+d)}};

function load(h,m,opt={}){
  const els={},lis={};
  const mk=()=>({textContent:'',hidden:false,innerHTML:'',value:'',dataset:{},style:{},classList:{toggle(){},add(){},remove(){}},children:[],scrollTop:0,setAttribute(){},focus(){this.focused=true},scrollIntoView(){},scrollBy(){},click(){},addEventListener(t,f){(this.L=this.L||{})[t]=f}});
  const get=s=>els[s]||(els[s]=mk());
  const lvEl=id=>els['lv'+id]||(els['lv'+id]=mk());
  const doc={
    querySelector:s=>{const mm=s.match(/data-lv="([^"]+)"/);if(mm)return get('#pl').innerHTML.includes('data-lv="'+mm[1]+'"')?lvEl(mm[1]):null;return get(s)},
    querySelectorAll:s=>s==='[data-lv]'?[...get('#pl').innerHTML.matchAll(/data-lv="([^"]+)"/g)].map(x=>lvEl(x[1])):[],
    getElementById:s=>get('#'+s),
    addEventListener:(t,f)=>{(lis[t]=lis[t]||[]).push(f)},
    documentElement:{dataset:{th:'cy'}},hidden:false,body:{appendChild(){}},createElement:()=>mk()};
  const store=opt.store||{};
  const ls=opt.brokenStorage?{getItem:()=>null,setItem(){throw new Error('quota')}}:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v}};
  class FD extends Date{constructor(...a){if(a.length)super(...a);else super(2026,9,10,h,m,0)}static now(){return new Date(2026,9,10,h,m,0).getTime()}}
  const fn=new Function('document','localStorage','Date','navigator','setInterval','addEventListener','matchMedia','getComputedStyle','scrollTo','confirm','location','File',
    code+'\n;return {S:()=>S,P,updateLive,compute,nz,okId,okPl,okHist};');
  const api=fn(doc,ls,FD,{},()=>{},()=>{},()=>({matches:false,addEventListener(){}}),()=>({getPropertyValue:()=>'#000'}),()=>{},()=>opt.confirm===undefined?true:opt.confirm,{reload(){}},class{});
  return {api,els,get,store,
    click:(a,extra)=>{const b={dataset:Object.assign({a},extra||{}),setAttribute(){}};lis.click.forEach(f=>f({target:{closest:()=>b}}))},
    input:t=>lis.input.forEach(f=>f({target:t}))};
}
const txt=(T,k)=>T.els[k]?T.els[k].textContent:undefined;

// --- 1) الشاشة الفاضية + أيقونة الساعة
{
  const T=load(16,40),S=T.api.S();
  let h=T.get('#pl').innerHTML;
  ok('لوحة الإجمالي مخفية في الأول',T.get('#live').hidden===true);
  ok('تحذير التخزين مخفي لما التخزين شغّال',T.get('#stw').hidden===true);
  ok('أيقونتين الساعة موجودين (من/إلى)',(h.match(/data-a="now"/g)||[]).length===2);
  ok('مفيش زراري «دخل دلوقتي» أو «خرج دلوقتي» القدام',!/data-a="join"|data-a="leave"/.test(h));
  ok('اسم زرار الوقت فيه القيمة (قارئ الشاشة)',h.includes('aria-label="من: اختر"'));
  const p=S.players[0],q=p.p[0];
  T.click('now',{p:p.id,q:q.id,f:'s'});
  ok('دوسة الساعة تكتب الوقت الحالي',q.s==='16:40',q.s);
  ok('اسم الزرار اتحدّث بالوقت',T.get('#pl').innerHTML.includes('aria-label="من: 4:40 م"'));
  q.s='10:00';T.click('now',{p:p.id,q:q.id,f:'s'});
  ok('الدوس على حقل متملّي ما بيغيّرش القيمة',q.s==='10:00');
  p.name='هيثم';q.s='15:00';T.click('now',{p:p.id,q:q.id,f:'e'});
  ok('الإجمالي 100 جنيه (15:00 إلى 16:40 بسعر 60)',txt(T,'#lt')==='100.00 جنيه',txt(T,'#lt'));
  T.click('addp');ok('إضافة لاعب',S.players.length===2);
}
// --- 2) الحساب
{
  const T=load(17,0),S=T.api.S();S.sr=60;S.mr=70;
  S.players=[{id:'a',name:'هيثم',p:[{id:'a1',s:'13:00',e:'16:00',t:'single'}]},{id:'b',name:'مازن',p:[{id:'b1',s:'13:00',e:'',t:'single'}]}];
  const r=T.api.compute();
  ok('حالة الشاشتين: 90/90 ومؤقت',r.rows.map(x=>x.c).join()==='9000,9000'&&r.live===true,r.rows.map(x=>x.c));
  S.players=[{id:'a',name:'أ',p:[{id:'a1',s:'13:00',e:'16:00',t:'single'}]},{id:'b',name:'ب',p:[{id:'b1',s:'17:00',e:'',t:'single'}]}];
  let m='';try{T.api.compute()}catch(e){m=e.message}
  ok('لاعب بعد نقطة الحساب = خطأ',m.includes('بعد نقطة الحساب'),m);
  S.players=[{id:'b',name:'ب',p:[{id:'b1',s:'18:00',e:'',t:'single'}]}];m='';try{T.api.compute()}catch(e){m=e.message}
  ok('بداية قريبة في المستقبل = «لسه ما جاش»',m.includes('لسه ما جاش'),m);
  const T2=load(16,40),S2=T2.api.S();
  S2.players=[{id:'b',name:'ب',p:[{id:'b1',s:'04:00',e:'',t:'single'}]}];m='';try{T2.api.compute()}catch(e){m=e.message}
  ok('بداية بعيدة = رسالة «بعيدة عن الوقت الحالي»',m.includes('بعيدة عن الوقت الحالي'),m);
  const T3=load(12,0),S3=T3.api.S();S3.sr=60;
  S3.players=[{id:'a',name:'أ',p:[{id:'a1',s:'23:00',e:'01:00',t:'single'}]},{id:'b',name:'ب',p:[{id:'b1',s:'23:30',e:'02:00',t:'single'}]}];
  const r3=T3.api.compute();
  ok('منتصف الليل: 75 و105',r3.rows.map(x=>x.c).join()==='7500,10500',r3.rows.map(x=>x.c));
  S3.players=[{id:'a',name:'أحمد',p:[{id:'a1',s:'10:00',e:'11:00',t:'single'}]},{id:'b',name:'احمد',p:[{id:'b1',s:'11:00',e:'12:00',t:'single'}]}];
  ok('أحمد واحمد بطاقتين منفصلتين',T3.api.compute().rows.length===2);
  S3.players=[{id:'a',name:'أ',p:[{id:'a1',s:'10:00',e:'11:00',t:'single'},{id:'a2',s:'10:30',e:'11:30',t:'single'}]}];m='';try{T3.api.compute()}catch(e){m=e.message}
  ok('فترتين متداخلتين لنفس اللاعب = خطأ',m.includes('متداخلين'),m);
  S3.sr=0;S3.players=[{id:'a',name:'أ',p:[{id:'a1',s:'10:00',e:'11:00',t:'single'}]}];m='';try{T3.api.compute()}catch(e){m=e.message}
  ok('سعر صفر = خطأ',m.includes('سعر'),m);
}
// --- 3) فتح جلسة محفوظة مؤقتة ما يغيّرش الرقم
{
  const T=load(21,0),S=T.api.S();S.sr=60;
  const rec={id:'sess1',at:Date.now(),total:18000,live:true,cp:'16:00',rd:false,sr:60,mr:70,players:[{id:'a',name:'ا',p:[{id:'a1',s:'13:00',e:'',t:'single'}]}]};
  ok('سجل فيه cp صالح',T.api.okHist(rec)===true);
  S.hist=[rec];T.click('load',{h:'sess1'});
  ok('الجلسة المؤقتة المحفوظة بتتحسب لحد وقت الحفظ (180 مش 480)',S.res&&S.res.total===18000,S.res&&S.res.total);
  ok('نقطة الحساب المجمّدة',S.fz==='16:00',S.fz);
  T.input({dataset:{f:'name',p:'a'},value:'ا'});
  ok('أي تعديل يفك التجميد',S.fz===null);
  ok('وبعده الحساب بالوقت الحالي (480)',txt(T,'#lt')==='480.00 جنيه',txt(T,'#lt'));
}
// --- 4) التحقق من الملفات المستوردة
{
  const T=load(12,0),A=T.api;
  const per={id:'q',s:'',e:'',t:'single'};
  ok('id سليم يتقبل',A.okPl({id:'ab12',name:'x',p:[per]}));
  ok('id فيه علامة اقتباس يترفض',!A.okPl({id:'a"onmouseover="x',name:'x',p:[per]}));
  ok('id فيه < يترفض',!A.okId('<img>'));
  ok('وقت بصيغة غلط يترفض',!A.okPl({id:'a',name:'x',p:[{id:'q',s:'25:99',e:'',t:'single'}]}));
  ok('cp غلط يترفض',!A.okHist({id:'h',at:1,total:0,sr:1,mr:1,players:[],cp:'zz'}));
}
// --- 5) فشل التخزين
{
  const T=load(12,0,{brokenStorage:true});
  ok('تحذير التخزين بيظهر لو الحفظ فشل',T.get('#stw').hidden===false);
}
// --- 6) الأرقام العربية في الأسعار
{
  const T=load(12,0),A=T.api,S=A.S();
  ok('٦٠ تتحوّل 60',A.nz('٦٠')==='60');
  ok('٧٫٥ تتحوّل 7.5',A.nz('٧٫٥')==='7.5');
  ok('فاصلتين عشريتين تتقلّل لواحدة',A.nz('1.2.3')==='1.23');
  const t={id:'sr',value:'٨٠'};T.input(t);
  ok('الإدخال العربي بيتخزّن 80 والخانة بتتحدّث',S.sr===80&&t.value==='80',S.sr+'/'+t.value);
}
// --- 7) إدخال الوقت بالكيبورد في نافذة العجلة
{
  const T=load(16,40),A=T.api,S=A.S(),p=S.players[0],q=p.p[0];
  T.click('time',{p:p.id,q:q.id,f:'s'});
  T.get('#kbt').L.change({target:{value:'19:23'}});
  ok('الوقت المكتوب بالكيبورد بيظبط العجلات (7:23 م)',A.P.h===7&&A.P.m===23&&A.P.ap===1&&A.P.ml.includes(23),JSON.stringify([A.P.h,A.P.m,A.P.ap]));
  T.click('tdone');
  ok('«تم» بيطبّق 19:23',q.s==='19:23',q.s);
}

// --- 9) انحدار: حساب عابر لمنتصف الليل + الإيصال القديم
{
  const P=(id,name,s,e)=>({id,name,p:[{id:id+'1',s,e,t:'single'}]});
  const run=(pl,h=12,m=0)=>{const T=load(h,m),S=T.api.S();S.sr=60;S.players=pl;return T.api.compute()};
  const cs=r=>r.rows.map(x=>x.c).join();
  let r=run([P('a','أ','23:00','01:00'),P('b','ب','01:00','02:00'),P('c','ج','23:00','')]);
  ok('عابر منتصف الليل: أ=60 ب=30 ج=90 ونقطة الحساب 02:00',cs(r)==='6000,3000,9000'&&r.cp==='02:00',cs(r)+' '+r.cp);
  r=run([P('a','أ','23:00','01:00'),P('b','ب','01:01','02:00'),P('c','ج','23:00','')]);
  ok('ب بيبدأ 01:01: نفس النتيجة تقريبًا',r.cp==='02:00'&&r.rows[1].c>0&&r.rows[1].c<3100&&r.rows[2].c>8900,cs(r)+' '+r.cp);
  r=run([P('a','أ','23:00','01:00'),P('b','ب','01:00','02:00')]);
  ok('فترتين ملزوقين عبر منتصف الليل: 120 و60',cs(r)==='12000,6000',cs(r));
  r=run([P('a','أ','23:00','01:00'),P('b','ب','01:30','02:30')]);
  ok('فترتين منفصلين بعد منتصف الليل: 120 و60',cs(r)==='12000,6000'&&r.hours===3,cs(r)+' '+r.hours);
  r=run([P('a','أ','10:00','11:00'),P('b','ب','11:00','12:00')]);
  ok('نفس اليوم من غير عبور: ما اتغيرش',cs(r)==='6000,6000');
  // الإيصال: النسخ بيحسب من جديد بعد ما الوقت يمشي
  const T=load(17,0),S=T.api.S();S.sr=60;S.players=[P('a','أ','13:00','')];
  T.click('calc');
  ok('الإيصال الأول 240',S.res&&S.res.total===24000,S.res&&S.res.total);
  S.fz='18:00';
  T.click('save');
  ok('الحفظ بعد ساعة بيخزّن 300 مش 240',S.hist[0]&&S.hist[0].total===30000&&S.res.total===30000,S.hist[0]&&S.hist[0].total);
}
// --- هوية اللاعبين + مسح الجلسة + استرجاع المسودة
{
  const T=load(12,0),S=T.api.S();
  S.sr=60;
  S.players=[{id:'a',name:'أحمد',p:[{id:'a1',s:'10:00',e:'11:00',t:'single'}]},
    {id:'b',name:'أحمد',p:[{id:'b1',s:'10:00',e:'12:00',t:'single'}]}];
  const r=T.api.compute();
  ok('نفس الاسم: حصتين منفصلتين 30 و90',r.rows.map(x=>x.c).join()==='3000,9000');
  ok('كل صف حساب مرتبط بهوية اللاعب',r.rows.map(x=>x.id).join()==='a,b');
  T.click('calc');T.click('rd');
  ok('نصيب البطاقة الأولى مش التانية',T.els.lva.textContent.includes('30.00')&&T.els.lvb.textContent.includes('90.00'));
  T.click('calc');T.click('save');
  const hist=JSON.stringify(S.hist),sid=S.sid;
  T.click('new');
  ok('المسح يعمل لاعب فاضي وفترة فاضية واحدة',S.players.length===1&&!S.players[0].name&&S.players[0].p.length===1&&!S.players[0].p[0].s&&!S.players[0].p[0].e);
  ok('المسح يشيل الحساب والتجميد ويجدد هوية الجلسة',S.res===null&&S.fz===null&&S.sid!==sid);
  ok('المسح يحافظ على الأسعار والسجل',S.sr===60&&JSON.stringify(S.hist)===hist);
  const reopened=load(12,0,{store:T.store}).api.S();
  ok('إعادة الفتح بعد المسح لا ترجع الأسماء والأوقات',!reopened.players[0].name&&!reopened.players[0].p[0].s);
  T.api.S().players[0].name='جديد';T.input({dataset:{f:'name',p:S.players[0].id},value:'جديد'});
  ok('الحفظ التلقائي لسه شغال بعد المسح',load(12,0,{store:T.store}).api.S().players[0].name==='جديد');
}
{
  const T=load(12,0,{confirm:false}),S=T.api.S();S.players[0].name='موجود';
  const before=JSON.stringify(S);T.click('new');
  ok('إلغاء تأكيد المسح لا يغير أي بيانات',JSON.stringify(S)===before);
  S.hist=[{id:'h'}];T.click('delh',{h:'h'});
  ok('إلغاء حذف جلسة محفوظة يحافظ عليها',S.hist.length===1);
}
{
  const T=load(12,0),S=T.api.S();S.hist=[{id:'h'}];T.click('delh',{h:'h'});
  ok('تأكيد حذف جلسة محفوظة يحذفها',S.hist.length===0&&JSON.parse(T.store.ps_hist).length===0);
}
console.log(`\n${pass} نجح، ${fail} فشل`);process.exit(fail?1:0);
