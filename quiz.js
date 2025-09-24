
const quizData = [
  { category: 'Schonzeiten',
    items: [
      {name: 'Äsche', value: '1.12. - 15.5.'},
      {name: 'Bachforelle', value: '15.9. - 31.3.'},
      {name: 'Barbe', value: '1.4. - 31.6.'},
      {name: 'Hecht', value: '15.2. - 30.4.'},
      {name: 'Zander', value: '15.2. - 31.5.'}
    ], twoStep:true
  },
  { category: 'Mindestmaße',
    items: [
      {name:'Aal', value:'50cm'},{name:'Äsche', value:'30cm'},{name:'Bachforelle', value:'25cm'},{name:'Barbe', value:'45cm'},
      {name:'Große Maräne', value:'30cm'},{name:'Hecht', value:'50cm'},{name:'Karpfen', value:'35cm'},{name:'Kleine Maräne', value:'12cm'},
      {name:'Quappe', value:'30cm'},{name:'Rapfen', value:'40cm'},{name:'Regenbogenforelle', value:'25cm'},{name:'Schleie', value:'25cm'},
      {name:'Zährte', value:'30cm'},{name:'Zander', value:'50cm'}
    ], twoStep:true
  },
  { category: 'Fangverbote',
    items: [
      {name:'Bachneunauge'}, {name:'Bitterling'}, {name:'Elritze'}, {name:'Finte'}, {name:'Flußneunauge'}, {name:'Groppe'},
      {name:'Lachs'}, {name:'Maifisch'}, {name:'Meerforelle'}, {name:'Meerneunauge'}, {name:'Moderlieschen'}, {name:'Nase'},
      {name:'Schlammpeitziger'}, {name:'Schmerle'}, {name:'Schneider'}, {name:'Steinbeißer'}, {name:'Stör'}, {name:'Nordseeschnäpel'}, {name:'Weißflossengründling'}
    ], twoStep:false
  }
];

let state = {qIndex:0, solved:[new Set(),new Set(),new Set()], allSolved:new Set(), currentItem:null};

const questionView=document.getElementById('questionView');
const solvedList=document.getElementById('solvedList');
const allSolvedList=document.getElementById('allSolvedList');
const progressText=document.getElementById('progressText');
const categoryTitle=document.getElementById('categoryTitle');
const overlay=document.getElementById('overlay');
const modalNext=document.getElementById('modalNext');

function normalizeName(s){return (s||'').trim().toLowerCase();}

function render(){
  progressText.textContent=`Frage ${state.qIndex+1} von 3`;
  solvedList.innerHTML='';
  allSolvedList.innerHTML='';
  categoryTitle.textContent=quizData[state.qIndex].category;
  if(quizData[state.qIndex].twoStep){
    renderTwoStep();
  }else{
    renderOneStep();
  }
}

function renderTwoStep(){
  const data=quizData[state.qIndex].items;
  questionView.innerHTML=`
  <h3 class="question-title">Frage ${state.qIndex+1} — ${quizData[state.qIndex].category}</h3>
  <div style="margin-bottom:10px;color:var(--muted)">Gib zuerst den Namen ein.</div>
  <div class="input-row">
    <input type="text" id="nameInput" placeholder="Name eingeben...">
    <button id="checkName">Prüfen</button>
    <button id="helpName" class="ghost">Name Hilfe</button>
    <span id="fb"></span>
  </div>
  <div id="valueRow" style="margin-top:12px; display:none">
    <input type="text" id="valueInput" placeholder="Wert eingeben...">
    <button id="checkValue">Prüfen</button>
    <button id="helpValue" class="ghost">Wert Hilfe</button>
    <span id="valueFb"></span>
  </div>`;

  const nameInput=document.getElementById('nameInput');
  const checkName=document.getElementById('checkName');
  const helpName=document.getElementById('helpName');
  const fb=document.getElementById('fb');
  const valueRow=document.getElementById('valueRow');
  const valueInput=document.getElementById('valueInput');
  const checkValue=document.getElementById('checkValue');
  const helpValue=document.getElementById('helpValue');
  const valueFb=document.getElementById('valueFb');

  function resetFeedback(){fb.textContent=''; fb.className=''; valueFb.textContent=''; valueFb.className='';}

  checkName.onclick=()=>{
    const val=normalizeName(nameInput.value);
    const found=data.find(d=>normalizeName(d.name)===val);
    if(found && !state.solved[state.qIndex].has(found.name)){
      fb.textContent='✓ richtig'; fb.className='feedback ok';
      valueRow.style.display='flex'; valueInput.value=''; valueFb.textContent=''; valueFb.className=''; state.currentItem=found;
    }else{fb.textContent='✗ falsch'; fb.className='feedback bad'; state.currentItem=null;}
  };

  checkValue.onclick=()=>{
    if(!state.currentItem) return;
    if(valueInput.value.trim()===state.currentItem.value){
      valueFb.textContent='✓ korrekt'; valueFb.className='feedback ok';
      state.solved[state.qIndex].add(state.currentItem.name);
      state.allSolved.add(`${state.currentItem.name} — ${state.currentItem.value}`);
      valueRow.style.display='none'; nameInput.value=''; valueInput.value=''; resetFeedback();
      updateSolvedList();
    }else{valueFb.textContent='✗ falsch'; valueFb.className='feedback bad';}
  };

  helpName.onclick=()=>{
    const unsolved=data.filter(d=>!state.solved[state.qIndex].has(d.name));
    if(unsolved.length>0){nameInput.value=unsolved[0].name; resetFeedback(); valueRow.style.display='none';}
  };

  helpValue.onclick=()=>{
    if(state.currentItem){valueInput.value=state.currentItem.value; resetFeedback();}
  };

  nameInput.addEventListener('keydown', e=>{if(e.key==='Enter') checkName.onclick();});
  valueInput.addEventListener('keydown', e=>{if(e.key==='Enter') checkValue.onclick();});
}

function renderOneStep(){
  const data=quizData[state.qIndex].items;
  questionView.innerHTML=`
  <h3 class="question-title">Frage ${state.qIndex+1} — ${quizData[state.qIndex].category}</h3>
  <div style="margin-bottom:10px;color:var(--muted)">Gib die Antwort ein.</div>
  <div class="input-row">
    <input type="text" id="itemInput" placeholder="Antwort eingeben...">
    <button id="checkItem">Prüfen</button>
    <button id="helpItem" class="ghost">Hilfe</button>
    <span id="fb"></span>
  </div>`;

  const itemInput=document.getElementById('itemInput');
  const checkItem=document.getElementById('checkItem');
  const helpItem=document.getElementById('helpItem');
  const fb=document.getElementById('fb');

  function resetFeedback(){fb.textContent=''; fb.className='';}

  checkItem.onclick=()=>{
    const val=normalizeName(itemInput.value);
    const found=data.find(d=>normalizeName(d.name)===val);
    if(found && !state.solved[state.qIndex].has(found.name)){
      fb.textContent='✓ korrekt'; fb.className='feedback ok';
      state.solved[state.qIndex].add(found.name);
      state.allSolved.add(found.name);
      itemInput.value=''; resetFeedback();
      updateSolvedList();
    }else{fb.textContent='✗ falsch'; fb.className='feedback bad';}
  };

  helpItem.onclick=()=>{
    const unsolved=data.filter(d=>!state.solved[state.qIndex].has(d.name));
    if(unsolved.length>0){itemInput.value=unsolved[0].name; resetFeedback();}
  };

  itemInput.addEventListener('keydown', e=>{if(e.key==='Enter') checkItem.onclick();});
}

function updateSolvedList(){
  solvedList.innerHTML='';
  state.solved[state.qIndex].forEach(n=>{
    let displayText=n;
    if(quizData[state.qIndex].twoStep){
      const item=quizData[state.qIndex].items.find(d=>d.name===n);
      if(item) displayText=`${item.name} — ${item.value}`;
    }
    const div=document.createElement('div'); div.className='solved-item'; div.textContent=displayText;
    solvedList.appendChild(div);
  });

  allSolvedList.innerHTML='';
  state.allSolved.forEach(n=>{
    const div=document.createElement('div'); div.className='solved-item'; div.textContent=n;
    allSolvedList.appendChild(div);
  });

  if(state.solved[state.qIndex].size===quizData[state.qIndex].items.length){
    overlay.classList.add('show');
  }
}

modalNext.onclick=()=>{
  overlay.classList.remove('show');
  state.qIndex++;
  if(state.qIndex>=quizData.length){
    alert('Quiz beendet!'); state.qIndex=0; state.solved=[new Set(),new Set(),new Set()]; state.allSolved=new Set();
  }
  render();
}

render();
