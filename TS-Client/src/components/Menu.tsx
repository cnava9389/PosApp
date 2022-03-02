import { Accessor, Component, ComponentProps, createSignal, Setter } from 'solid-js';
import { Item, TicketItem } from '../context/Models';
import { useUserContext } from '../context/UserContext';

interface MenuProps extends ComponentProps<any> {
  qty: Accessor<number>
  setQty: Setter<number>
  metaData?: Accessor<any>
  setMetaData?: Setter<any>
}

const Menu: Component<MenuProps> = (props: MenuProps) => {
  let one:any,two:any,three:any,four:any
  const tabClick = (e:any) =>{
    e.preventDefault();
    one.className='nav-link'
    two.className='nav-link'
    three.className='nav-link'
    four.className='nav-link'
    e.target.className = 'nav-link active'
    setOption(e.target.innerText)
}
  const [option, setOption] = createSignal('a')
  const menuSetter = (option:string) =>{
    switch (option){
        case 'Items':
            return <Items qty={props.qty} setQty={props.setQty}/>
        case 'Ingredients':
            return <Ingredients qty={props.qty} metaData={props.metaData} setMetaData={props.setMetaData} setQty={props.setQty}/>
        case 'Other':
            return <Other/>
        case 'Meats':
            return <Meats qty={props.qty} metaData={props.metaData} setMetaData={props.setMetaData} setQty={props.setQty}/>
        default:
            return <Items qty={props.qty} setQty={props.setQty}/>
    }
}
    return (
        <div class="card h-100 shadow-lg p-1 customBack">
        <div class="tab d-flex justify-content-center">
          <ul class="nav nav-pills">
            <li class="nav-item">
              <button  ref={one} onClick={tabClick} class="nav-link active">
                Items
              </button>
            </li>
            <li class="nav-item">
              <button ref={two} onClick={tabClick} class="nav-link">
                Ingredients
              </button>
            </li>
            <li class="nav-item">
              <button ref={four} onClick={tabClick} class="nav-link">
                Meats
              </button>
            </li>
            <li class="nav-item">
              <button ref={three} onClick={tabClick} class="nav-link">
                Other
              </button>
            </li>
          </ul>
        </div>
        <div class='menuContainer card shadow-lg'>
            {
                menuSetter(option())
            }
        </div>
      </div>
    )
}

export default Menu;
const Items = (props: MenuProps) => {
  const [{items, ticket},{setTicket, updateTicket}] = useUserContext()
  const buttonClick = (x:Item) => {
    const Qty = props.qty()===0?1:props.qty()
    const x_price = x.price || 0.0
    setTicket({...ticket(),items:[...ticket().items,{qty:Qty,name:x.name,type:x.type,price:x_price,description:''}]})
    props.setQty(0)
    const price = x_price * Qty
    updateTicket(price)
  }
  return <>
  <div class='row'>
    {
      items().map((x)=>{
        if(x.type=='food'){
          return <div class='col-3 menuItem'>
          <button onClick={()=>buttonClick(x)} data-price={x.price} class='btn btn-dark w-100 h-100'>{x.name}</button>
    </div>
        }
      })
    }
  </div>
  </>
}

const Ingredients = (props: MenuProps) => {
  const [{items, ticket},{setTicket, updateTicket}] = useUserContext()
  const setOption = (e:any) => {
    if(ticket().items.length<1){
      return
    }
    const option = e.target.innerText
    let lastItem = ticket().items[ticket().items.length - 1]
    lastItem = {...lastItem}
    if(!lastItem){
      return
    }
    // there is no description
    if(!lastItem.description){
      lastItem.description = `${props.qty()?props.qty():1} x ${option} `
    }else{//there is a description
      lastItem.description += `,${props.qty()?props.qty():1} x ${option} `
    }
    let restOfItems = ticket().items.slice(0,-1)
    setTicket({...ticket(),items:[...restOfItems,lastItem]})
    props.setQty(0)
  }
  const setIngredient = (e:any) => {
    
    //returns if there are no items in list
    if(ticket().items.length<1){
      return
    }
    const ingredient = e.target.innerText
    let lastItem = ticket().items[ticket().items.length - 1]
    lastItem = {...lastItem}
    // returns if for some reason the last item from list is not there
    if(!lastItem){
      return
    }
    //copies over rest of items from list
    let restOfItems = ticket().items.slice(0,-1)
    //if there is no description then just add the 1 x con ${ingredient}` and set items
    if(!lastItem.description){
      lastItem.description = `1 x con ${ingredient}`
      setTicket({...ticket(),items:[...restOfItems,lastItem]})
    }else{ //if there is a description
        //split the description and search if ingredient is one of the elements
        const description = lastItem.description.split(',')
        const found = description.findIndex(x=>x.indexOf(ingredient)==-1?false:true)
        // this checks if description after split is 1, does not contain ingredient, and also does not contain another
        // ingredient in there
        if(description.length==1 && found==-1 && !description[0].split(' ')[3]){
          lastItem.description += ingredient
          setTicket({...ticket(),items:[...restOfItems,lastItem]})
        }else if(found!=-1){// list is longer than 1 and ingredient index is found
          let amount = parseInt(description[found].match(/\d+/)![0])
          amount = amount+1
          const check = description[found].indexOf('con')
          description[found] = `${amount} x ${check!==-1?'con':'no'} ${ingredient}`
          lastItem.description = description.join(',')
          setTicket({...ticket(),items:[...restOfItems,lastItem]})
        }else{ // description is longer than 1 and ingredient index is not found
          const last = lastItem.description.split(',')[lastItem.description.split(',').length - 1]
          if(last == undefined){
            lastItem.description.split(" ").length == 3? lastItem.description+= ingredient:lastItem.description+= `,1 x con ${ingredient}`
          }else if (last.split(" ")[last.split(" ").length- 1] ===""){
            lastItem.description += ingredient
          }else{
            lastItem.description += `,1 x con ${ingredient}`
          }
          setTicket({...ticket(),items:[...restOfItems,lastItem]})
        }
    }
    if (!lastItem.description.split(",")[lastItem.description.split(",").length-1].includes("no")){
      const x = parseFloat(e.target.getAttribute("data-price"))
      if(x!=0 && !isNaN(x)){
        const split = ingredient.split(' ')
        if(props.metaData!()[ingredient]==undefined){
          split.length == 2? props.metaData!()[split[1]] = x: props.metaData!()[`${split[1]} ${split[2]}`] = x
        }
        updateTicket(x)
      }
    }
  }
  return <>
  <div class='row h-25'>
      <div class='col-6 h-25 d-flex justify-content-center'>
          <button onClick={setOption} class='btn btn-dark'>no</button>
      </div>
      <div class='col-6 h-25 d-flex justify-content-center'>
          <button onClick={setOption} class='btn btn-dark'>con</button>
      </div>
      {
      items().map((x)=>{
        if(x.type=='ingredient'){
          return <div class='col-3 menuItem mt-2'>
          <button onClick={setIngredient} data-price={x.price} class='btn btn-dark w-100 h-75'>{!x.price?x.name:`$${x.price} ${x.name}`}</button>
    </div>
        }
      })
    }
  </div>
  </>
}

const Meats = (props: MenuProps) => {
  const [{items, ticket},{setTicket, updateTicket}] = useUserContext()
  const setOption = (e:any) => {
    if(ticket().items.length<1){
      return
    }
    const option = e.target.innerText
    let lastItem = ticket().items[ticket().items.length - 1]
    lastItem = {...lastItem}
    if(!lastItem){
      return
    }
    // there is no description
    if(!lastItem.description){
      lastItem.description = `${props.qty()?props.qty():1} x ${option} `
    }else{//there is a description
      lastItem.description += `,${props.qty()?props.qty():1} x ${option} `
    }
    let restOfItems = ticket().items.slice(0,-1)
    setTicket({...ticket(),items:[...restOfItems,lastItem]})
    props.setQty(0)
  }
  const setMeat = (e:any) => {
    
    //returns if there are no items in list
    if(ticket().items.length<1){
      return
    }
    const ingredient = e.target.innerText
    let lastItem = ticket().items[ticket().items.length - 1]
    lastItem = {...lastItem}
    // returns if for some reason the last item from list is not there
    if(!lastItem){
      return
    }
    //copies over rest of items from list
    let restOfItems = ticket().items.slice(0,-1)
    //if there is no description then just add the 1 x con ${ingredient}` and set items
    if(!lastItem.description){
      lastItem.description = `1 x con ${ingredient}`
      setTicket({...ticket(),items:[...restOfItems,lastItem]})
    }else{ //if there is a description
        //split the description and search if ingredient is one of the elements
        const description = lastItem.description.split(',')
        const found = description.findIndex(x=>x.indexOf(ingredient)==-1?false:true)
        // this checks if description after split is 1, does not contain ingredient, and also does not contain another
        // ingredient in there
        if(description.length==1 && found==-1 && !description[0].split(' ')[3]){
          lastItem.description += ingredient
          setTicket({...ticket(),items:[...restOfItems,lastItem]})
        }else if(found!=-1){// list is longer than 1 and ingredient index is found
          let amount = parseInt(description[found].match(/\d+/)![0])
          amount = amount+1
          const check = description[found].indexOf('con')
          description[found] = `${amount} x ${check!==-1?'con':'no'} ${ingredient}`
          lastItem.description = description.join(',')
          setTicket({...ticket(),items:[...restOfItems,lastItem]})
        }else{ // description is longer than 1 and ingredient index is not found
          const last = lastItem.description.split(',')[lastItem.description.split(',').length - 1]
          if(last == undefined){
            lastItem.description.split(" ").length == 3? lastItem.description+= ingredient:lastItem.description+= `,1 x con ${ingredient}`
          }else if (last.split(" ")[last.split(" ").length- 1] ===""){
            lastItem.description += ingredient
          }else{
            lastItem.description += `,1 x con ${ingredient}`
          }
          setTicket({...ticket(),items:[...restOfItems,lastItem]})
        }
    }
    if (!lastItem.description.split(",")[lastItem.description.split(",").length-1].includes("no")){
      const x = parseFloat(e.target.getAttribute("data-price"))
      if(x!=0 && !isNaN(x)){
        const split = ingredient.split(' ')
        if(props.metaData!()[ingredient]==undefined){
          split.length == 2? props.metaData!()[split[1]] = x: props.metaData!()[`${split[1]} ${split[2]}`] = x
        }
        updateTicket(x)
      }
    }
  }
  return<>
  <div class='row h-25'>
      <div class='col-6 h-25 d-flex justify-content-center'>
          <button onClick={setOption} class='btn btn-dark'>no</button>
      </div>
      <div class='col-6 h-25 d-flex justify-content-center'>
          <button onClick={setOption} class='btn btn-dark'>con</button>
      </div>
      {
      items().map((x)=>{
        if(x.type=='meat'){
          return <div class='col-3 menuItem mt-2'>
          <button onClick={setMeat} data-price={x.price} class='btn btn-dark w-100 h-75'>{!x.price?x.name:`$${x.price} ${x.name}`}</button>
    </div>
        }
      })
    }
  </div>
  </>
}

const Other = () => {
  return<div class="d-flex justify-content-center align-items-center h-100">
  Coming soon...
  </div>
}