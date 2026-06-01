// Incremental game: improved upgrade UI (cost display + disable when unaffordable)
const stateKey = 'incremental-starter-v1'
const defaultState = {
  coins: 0,
  cps: 0,
  upgrades: [
    { id: 'autoclicker', name: 'Auto Miner', level: 0, baseCost: 15, baseCps: 1 },
    { id: 'drill', name: 'Drill', level: 0, baseCost: 100, baseCps: 10 }
  ],
  lastTick: Date.now()
}
let state = loadState()

// DOM refs
const el = {
  coins: document.getElementById('coins'),
  cps: document.getElementById('cps'),
  clicker: document.getElementById('clicker'),
  upgrades: document.getElementById('upgrades'),
  save: document.getElementById('save'),
  reset: document.getElementById('reset')
}

function format(n){ return Math.floor(n).toLocaleString() }
function saveState(){ localStorage.setItem(stateKey, JSON.stringify(state)) }
function loadState(){ try{ const s = JSON.parse(localStorage.getItem(stateKey)); return s ? s : JSON.parse(JSON.stringify(defaultState)) }catch(e){ return JSON.parse(JSON.stringify(defaultState)) } }

function recalcCps(){
  let cps = 0
  state.upgrades.forEach(u => cps += u.level * u.baseCps)
  state.cps = cps
}

function render(){
  el.coins.textContent = format(state.coins)
  el.cps.textContent = state.cps.toFixed(1)
  el.upgrades.innerHTML = ''

  state.upgrades.forEach(u => {
    const cost = Math.floor(u.baseCost * Math.pow(1.15, u.level))
    const div = document.createElement('div')
    div.className = 'upgrade'
    const meta = document.createElement('div')
    meta.className = 'meta'
    meta.innerHTML = `<div><strong>${u.name}</strong> <small>Lv ${u.level}</small></div><div style="opacity:0.8">+${u.baseCps}/s each</div>`

    const actions = document.createElement('div')
    const costSpan = document.createElement('span')
    costSpan.textContent = cost
    costSpan.style.marginRight = '0.5rem'

    const btn = document.createElement('button')
    btn.textContent = `Buy (${cost})`
    btn.dataset.id = u.id
    btn.disabled = state.coins < cost
    btn.setAttribute('aria-disabled', btn.disabled)

    btn.addEventListener('click', ()=>{ buyUpgrade(u.id) })

    actions.appendChild(costSpan)
    actions.appendChild(btn)

    div.appendChild(meta)
    div.appendChild(actions)
    el.upgrades.appendChild(div)
  })
}

function buyUpgrade(id){
  const u = state.upgrades.find(x=>x.id===id)
  const cost = Math.floor(u.baseCost * Math.pow(1.15, u.level))
  if (state.coins >= cost){
    state.coins -= cost
    u.level += 1
    recalcCps()
    render()
    saveState()
  } else {
    // visual feedback for unaffordable click
    const btn = document.querySelector(`button[data-id="${id}"]`)
    if (btn) { btn.animate([{transform:'translateY(0)'},{transform:'translateY(-4px)'},{transform:'translateY(0)'}],{duration:200}) }
  }
}

el.clicker.addEventListener('click', ()=>{ state.coins += 1; render(); })
el.save.addEventListener('click', ()=>{ saveState(); alert('Saved') })
el.reset.addEventListener('click', ()=>{ if (confirm('Reset game?')){ localStorage.removeItem(stateKey); state = JSON.parse(JSON.stringify(defaultState)); recalcCps(); render() } })

// Tick
recalcCps()
render()
setInterval(()=>{
  const now = Date.now()
  const dt = (now - state.lastTick)/1000
  state.lastTick = now
  state.coins += state.cps * dt
  render()
}, 1000)

// Autosave
setInterval(()=>{ saveState() }, 10000)
