const q=(s)=>document.querySelector(s);
const emailOk=(v)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const usersKey='astro_users';
const currentKey='astro_current_user';
function getUsers(){try{return JSON.parse(localStorage.getItem(usersKey)||'[]')}catch(e){return[]}}
function saveUsers(arr){localStorage.setItem(usersKey,JSON.stringify(arr))}
function signupUser(email,pwd){const users=getUsers();if(users.find(u=>u.email.toLowerCase()===email.toLowerCase()))return{ok:false,msg:'Email already registered'};users.push({email,password:pwd});saveUsers(users);return{ok:true}}
function loginUser(email,pwd){const users=getUsers();const found=users.find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.password===pwd);if(!found)return{ok:false,msg:'Invalid credentials'};localStorage.setItem(currentKey,email);return{ok:true}}
function currentUser(){return localStorage.getItem(currentKey)}
function requireAuth(){if(!currentUser())location.href='login.html'}
function starfield(){const c=q('#starfield');if(!c)return;const ctx=c.getContext('2d');let w=innerWidth,h=innerHeight;let stars=[];function resize(){w=innerWidth;h=innerHeight;c.width=w;c.height=h}
function make(){stars=Array.from({length:Math.floor((w*h)/8000)},()=>({x:Math.random()*w,y:Math.random()*h,z:Math.random()*0.8+0.2,s:Math.random()*1.5+0.3,v:(Math.random()*0.6+0.2)}))}
function draw(){ctx.clearRect(0,0,w,h);for(const st of stars){ctx.beginPath();ctx.globalAlpha=st.z;ctx.fillStyle='#c7b5ff';ctx.arc(st.x,st.y,st.s,0,Math.PI*2);ctx.fill();st.y+=st.v;st.x+=Math.sin(st.y*0.01)*0.1;if(st.y>h){st.y=0;st.x=Math.random()*w}}
requestAnimationFrame(draw)}
resize();make();draw();addEventListener('resize',()=>{resize();make()})}
function route(){const p=document.body.dataset.page;if(!p)return;starfield();if(p==='home'){}else if(p==='signup'){const form=q('#signupForm');const email=q('#signupEmail');const pwd=q('#signupPassword');const conf=q('#signupConfirm');const msg=q('#signupMessage');form.addEventListener('submit',(e)=>{e.preventDefault();const em=email.value.trim();const pw=pwd.value;const cf=conf.value;if(!emailOk(em)){msg.textContent='Enter a valid email';msg.style.color='#ff8a8a';return}if(pw.length<6){msg.textContent='Password must be at least 6 characters';msg.style.color='#ff8a8a';return}if(pw!==cf){msg.textContent='Passwords do not match';msg.style.color='#ff8a8a';return}const res=signupUser(em,pw);if(!res.ok){msg.textContent=res.msg;msg.style.color='#ff8a8a';return}msg.textContent='Signup successful. Redirecting to login...';msg.style.color='#8cffb5';setTimeout(()=>location.href='login.html',900)})}
else if(p==='login'){const form=q('#loginForm');const email=q('#loginEmail');const pwd=q('#loginPassword');const msg=q('#loginMessage');form.addEventListener('submit',(e)=>{e.preventDefault();const em=email.value.trim();const pw=pwd.value;const res=loginUser(em,pw);if(!res.ok){msg.textContent=res.msg;msg.style.color='#ff8a8a';return}msg.textContent='Login successful';msg.style.color='#8cffb5';setTimeout(()=>location.href='astrologers.html',600)})}
else if(p==='astrologers'){requireAuth();const btn=q('#chatRagiBtn');btn.addEventListener('click',()=>{location.href='chat-ragi.html'})}
else if(p==='chat'){requireAuth();initChat();setupDetails()}}
function chatKey(){const u=currentUser()||'guest';return 'astro_chat_ragi:'+u}
function loadChat(){try{return JSON.parse(localStorage.getItem(chatKey())||'[]')}catch(e){return[]}}
function saveChat(arr){localStorage.setItem(chatKey(),JSON.stringify(arr))}
function addBubble(sender,text){const wrap=q('#chatWindow');const div=document.createElement('div');div.className='bubble '+sender;div.textContent=text;wrap.appendChild(div);wrap.scrollTop=wrap.scrollHeight}
function showTyping(s){const t=q('#typing');t.style.display=s?'block':'none'}
function replyFor(txt){const t=txt.toLowerCase();const z=['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];for(const s of z){if(t.includes(s))return 'The '+s+' aura is vibrant. Trust your inner compass.'}
if(t.includes('love'))return 'Love aligns when intention is pure. Nurture and it grows.'
if(t.includes('career'))return 'Career stars rise with consistent focus. Elevate your skills.'
if(t.includes('health'))return 'Balance body and mind. Gentle routines bring clarity.'
if(t.includes('wealth'))return 'Prosperity flows to patience and planning. Avoid haste.'
if(t.includes('study')||t.includes('exam'))return 'Study with rhythm. Breaks sharpen recall and confidence.'
const r=['Today favors reflection and small bold steps.','Your energy peaks soon; prepare with gratitude.','A mentor appears when you ask better questions.','Trust cycles; endings fuel luminous beginnings.','Choose simplicity; it unlocks hidden doors.'];
return r[Math.floor(Math.random()*r.length)]}
function initChat(){const win=q('#chatWindow');const input=q('#chatInput');const send=q('#sendBtn');const hist=loadChat();if(hist.length===0){const greet='Welcome. Share your question, and I will read the sky.';hist.push({sender:'ragi',text:greet,ts:Date.now()});saveChat(hist)}
for(const m of hist){addBubble(m.sender,m.text)}
if(missingDetails().length){addBubble('ragi','To read your stars, share your date of birth (YYYY-MM-DD), time (HH:MM 24h), and place of birth (City, Country). You can send them together or step by step.')}
function sendMsg(){const text=input.value.trim();if(!text)return;addBubble('user',text);const hist=loadChat();hist.push({sender:'user',text,ts:Date.now()});saveChat(hist);input.value='';const updated=collectDetailsFromText(text);if(updated){addBubble('ragi','Noted: '+profileSummary(getProfile()))}
const missing=missingDetails();if(missing.length){addBubble('ragi',nextDetailPrompt(missing[0]));return}
if(!groqKey()){addBubble('ragi','Set your Groq API key in Settings to receive astrologer AI replies.');const modal=q('#settingsModal');if(modal)modal.classList.add('show');return}
showTyping(true);groqReply(text).then((rep)=>{const r=rep||'I sense motion in your chart—focus and gratitude open doors.';addBubble('ragi',r);const h=loadChat();h.push({sender:'ragi',text:r,ts:Date.now()});saveChat(h);showTyping(false)}).catch((err)=>{addBubble('ragi','AI is unavailable right now ('+ (err&&err.message||'error') +').');showTyping(false)})}
send.addEventListener('click',sendMsg);input.addEventListener('keydown',(e)=>{if(e.key==='Enter')sendMsg()});setupSettings()}
const groqKeyKey='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';
const groqModelKey='astro_groq_model';
const aiEnabledKey='astro_ai_enabled';
function aiActive(){return (localStorage.getItem(aiEnabledKey)==='true')||(!localStorage.getItem(aiEnabledKey)&&groqKey())}
function groqKey(){return localStorage.getItem(groqKeyKey)||''}
function saveGroqKey(v){localStorage.setItem(groqKeyKey,v)}
function clearGroqKey(){localStorage.removeItem(groqKeyKey)}
function groqModel(){return localStorage.getItem(groqModelKey)||'llama3-8b-8192'}
function saveGroqModel(v){localStorage.setItem(groqModelKey,v)}
function aiEnabled(){return localStorage.getItem(aiEnabledKey)==='true'}
function saveAiEnabled(v){localStorage.setItem(aiEnabledKey,v?'true':'false')}
async function groqReply(text){const url='https://api.groq.com/openai/v1/chat/completions';const key=groqKey();const model=groqModel();const hist=loadChat().slice(-6).map(m=>({role:m.sender==='user'?'user':'assistant',content:m.text}));const body={model,temperature:0.7,max_tokens:220,messages:[{role:'system',content:'You are Master Ragi, a wise, warm astrologer. Reply in 1-3 concise sentences with practical, uplifting guidance. Use simple words, occasional cosmic metaphors, and avoid disclaimers. Keep a respectful, gold-and-purple aura tone. Use the user\'s birth details when relevant.'},{role:'system',content:'Birth details: '+profileSummary(getProfile())},...hist,{role:'user',content:text}]};const res=await fetch(url,{method:'POST',headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!res.ok)throw new Error('bad');const data=await res.json();const out=data&&data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content;return out}
function setupSettings(){const modal=q('#settingsModal');const open=q('#settingsBtn');const close=q('#closeSettingsBtn');const save=q('#saveSettingsBtn');const clear=q('#clearKeyBtn');const keyInput=q('#apiKeyInput');const modelSel=q('#modelSelect');const ai=q('#aiToggle');const msg=q('#settingsMsg');function sync(){keyInput.value=groqKey();modelSel.value=groqModel();ai.checked=aiEnabled();msg.textContent=''}
open.addEventListener('click',(e)=>{e.preventDefault();sync();modal.classList.add('show')});
close.addEventListener('click',()=>{modal.classList.remove('show')});
save.addEventListener('click',()=>{const k=keyInput.value.trim();saveGroqKey(k);saveGroqModel(modelSel.value);saveAiEnabled(ai.checked||!!k);msg.textContent='Saved';msg.style.color='#8cffb5'});
clear.addEventListener('click',()=>{clearGroqKey();keyInput.value='';msg.textContent='Key cleared';msg.style.color='#ffcf88'})}
document.addEventListener('DOMContentLoaded',route);
const profileKeyPrefix='astro_profile:';
function profileKey(){const u=currentUser()||'guest';return profileKeyPrefix+u}
function getProfile(){try{return JSON.parse(localStorage.getItem(profileKey())||'{}')}catch(e){return{}}}
function saveProfile(p){localStorage.setItem(profileKey(),JSON.stringify(p))}
function missingDetails(){const p=getProfile();const miss=[];if(!p.dob)miss.push('dob');if(!p.time)miss.push('time');if(!p.place)miss.push('place');return miss}
function nextDetailPrompt(k){if(k==='dob')return 'Please share your date of birth (YYYY-MM-DD).';if(k==='time')return 'What is your birth time? (HH:MM 24h).';return 'Where were you born? (City, Country).'}
function profileSummary(p){const a=[];if(p&&p.dob)a.push('DOB '+p.dob);if(p&&p.time)a.push('Time '+p.time);if(p&&p.place)a.push('Place '+p.place);return a.length?a.join(', '):'not provided'}
function collectDetailsFromText(t){let changed=false;const p=getProfile();const date=t.match(/\b(\d{4}-\d{2}-\d{2}|\d{2}[\/\.-]\d{2}[\/\.-]\d{4})\b/);if(date&&!p.dob){let d=date[1].replace(/\./g,'/');if(/\d{2}[\/\.-]\d{2}[\/\.-]\d{4}/.test(d)){const parts=d.replace(/\./g,'-').replace(/[\/]/g,'-').split('-');d=parts[2]+'-'+parts[1].padStart(2,'0')+'-'+parts[0].padStart(2,'0')}p.dob=d;changed=true}
const time=t.match(/\b(\d{1,2}:\d{2})\b/);if(time&&!p.time){p.time=time[1];changed=true}
const ampm=t.match(/\b(\d{1,2}):(\d{2})\s*(AM|PM)\b/i);if(ampm&&!p.time){let h=parseInt(ampm[1],10)%12;if(ampm[3].toUpperCase()==='PM')h+=12;p.time=String(h).padStart(2,'0')+':'+ampm[2];changed=true}
let placeText=null;let m=t.match(/born in\s+([^\.\n]+?)(?:[\.!]|$)/i);if(m)placeText=m[1];if(!placeText){m=t.match(/from\s+([^\.\n]+?)(?:[\.!]|$)/i);if(m)placeText=m[1]}if(!placeText){m=t.match(/\(([^)]+)\)/);if(m)placeText=m[1]}if(!placeText){m=t.match(/([A-Za-z][A-Za-z .'-]+,\s*[A-Za-z][A-Za-z .'-]+)/);if(m)placeText=m[1]}if(placeText&&!p.place){const txt=placeText.trim().replace(/^['"]|['"]$/g,'');if(txt.length>=3)p.place=txt,changed=true}
if(changed)saveProfile(p);return changed}
function setupDetails(){const modal=q('#detailsModal');const open=q('#detailsBtn');const close=q('#closeDetailsBtn');const save=q('#saveDetailsBtn');const dob=q('#dobInput');const time=q('#timeInput');const place=q('#placeInput');const msg=q('#detailsMsg');function sync(){const p=getProfile();dob.value=p.dob||'';time.value=p.time||'';place.value=p.place||'';msg.textContent=''}
open.addEventListener('click',(e)=>{e.preventDefault();sync();modal.classList.add('show')});
close.addEventListener('click',()=>{modal.classList.remove('show')});
save.addEventListener('click',()=>{const p=getProfile();if(dob.value)p.dob=dob.value;if(time.value)p.time=time.value;if(place.value)p.place=place.value.trim();saveProfile(p);msg.textContent='Saved';msg.style.color='#8cffb5'})}