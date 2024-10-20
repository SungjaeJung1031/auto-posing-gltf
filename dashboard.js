/*Dashboard section*/
function parseObject(object,depth = 1 ,...ancestors ){
  if(!object)return
  const {x,y,z}               = object.position     
  const {x:xq,y:yq,z:zq,w}    = object.quaternion
  const {name,type}           = object 
    // const 
  const structure  = `${ Array(ancestors.length).fill(0).map(x=>" ").reduce((p,c)=>`${p}${c}`,"")}-${name}`
  const positions  = `[${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}]`
  const quaternion = `[${xq.toFixed(3)},${yq.toFixed(3)},${zq.toFixed(3)},${w.toFixed(3)}]`
  console.log(`${structure.padEnd(40)} ${type.padEnd(15)} p: ${positions.padEnd(25)} q: ${quaternion.padEnd(25)}`)
    object.children?.forEach((child)=>{   parseRoot(child,depth+1,...ancestors,depth)   })
  }
  window.parseObject =parseObject

  function displayTrackValues(dashboard,trackName){   
    const headers          =  ["T","X","Y","Z","W"]
    const {times,values}   =  clip.tracks.filter(x=>x.name===trackName)[0]
    const n                =  values.length / times.length
    const title            =  document.createElement('span');
    title.innerText        =  trackName
    title.style.color      = "#AAAAAA"
    dashboard.appendChild(title)
    const table            =  document.createElement('table');
    table.id               = 'track'  
    table.style.width      = "100%";   
    dashboard.appendChild(table)
    const headerRow        =  document.createElement('tr');
    [...Array(n+1).keys()].map((x,i)=>{
    const el           = document.createElement('th');
    el.innerText       = headers[i];
    el.style.color     = "#00ff00"
    return el
    })
    .map(x=>headerRow.appendChild(x))
    table.appendChild(headerRow)
    times.map((time,index)=>{
      const row               = document.createElement('tr')
      const cell              = document.createElement('td')    
      cell.innerText          = time.toFixed(3)
      cell.style.color        = "#ff00ff"
      row.appendChild(cell)     
      const offset = (index*n) 
      const vs     = []
    vs.push(values[offset],values[offset + 1],values[offset + 2])
    if(n===4) vs.push(values[offset + 3])          
    vs.map((v)=>{
      const cell              = document.createElement('td')     
      cell.innerText          =  v.toFixed(3)
      cell.style.color        = "#cccccc"
      row.appendChild(cell)
    })
    table.appendChild(row)
    })
  } 

  function createDashBoard(){
    dashboard                 = document.createElement('div')
    dashboard.id              ='dashboard'   
    dashboard.style.position  = "absolute";
    dashboard.style.top       = "0px";
    dashboard.style.left      = "0px";
    dashboard.style.width     = "400px"; 
    document.body.appendChild(dashboard)  
  }