import { Component, ComponentProps, onMount, createSignal} from 'solid-js';
import { useUserContext } from '../context/UserContext';
import {Item} from "../context/Models"
import { AxiosResponse } from 'axios';
import { invoke } from '@tauri-apps/api/tauri'


interface SettingsProps extends ComponentProps<any> {
    // add props here
}

//! maybe add some actual settings

const Settings: Component<SettingsProps> = () => {
    const [{animate},{setPathfunc}] = useUserContext()
    onMount(()=>{
        setPathfunc()
        animate(false,".setting")
    })
    let one:any, two:any, three:any, four:any;
    const [option, setOption] = createSignal('a')
    const tabClick = (e:any) => {
      one.className='nav-link'
      two.className='nav-link'
      three.className='nav-link'
      four.className='nav-link'
      e.target.className = 'nav-link active'
      setOption(e.target.innerText)
    }
  
    const settingSetter = (option:string) => {
        switch (option){
          case 'Create Item':
              return <CreateItem/>
          case 'Delete Item':
              return <DeleteItem />
          case 'All Items':
              return <AllItems />
          case 'Other':
              return <OtherOptions />
          default:
              return <CreateItem />
        }
    }
    return (
      <div class="setting h-100" style={{"opacity":0}}>
        <div class="row d-flex justify-content-center h-100 w-100">
          <div class="col-8 h-100">
            <div class="card h-100 customBack shadow-lg">
              <div class="tab d-flex justify-content-center">
                <ul class="nav nav-pills">
                  <li class="nav-item">
                    <button ref={one} onClick={tabClick} class="nav-link active">
                      Create Item
                    </button>
                  </li>
                  <li class="nav-item">
                    <button ref={two} onClick={tabClick} class="nav-link">
                      Delete Item
                    </button>
                  </li>
                  <li class="nav-item">
                    <button ref={four} onClick={tabClick} class="nav-link">
                      All Items
                    </button>
                  </li>
                  <li class="nav-item">
                    <button ref={three} onClick={tabClick} class="nav-link">
                      Other
                    </button>
                  </li>
                </ul>
              </div>
              <div class="card-body h-100">
                  {
                      settingSetter(option())
                  }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default Settings;

const CreateItem = () => {
    const [{api, native, socket},{setForm, setNotification, setUpStore, setItems}] = useUserContext()
    const [name, setName] = createSignal("")
    const [price, setPrice] = createSignal<number>(0.0)
    const [type, setType] = createSignal("Food")
    const [description, setDescription] = createSignal("")

    //!*
    const submit = async(e:any) => {
        e.preventDefault()
        // const [{fetchItems}] = await setUpStore()
        const form: Item = {
            name:name(),
            price:price(),
            type:type().toLowerCase(),
            description:description()
        }
        try{
            let result: AxiosResponse<any, any>;
            if(!native()){
                result = await api.post("/item/",form,{withCredentials:true})
                // socket().send(JSON.stringify({type:"broadcast",data:{type:"addItem",data:result.data}}))
            }else{
                result =  await invoke("create_item", {jsType: form.type, name: 
                    form.name, description: form.description, price: form.price})
                // console.log(result)
            }
            setNotification(false,"Created Item!")
            // await fetchItems()
            setItems((x:Item[])=>[...x,result.data])
        }catch(err){
            console.log(err)
            setNotification(true,"Error creating Item!")
        }
        setName("")
        setPrice(0.0)
        setType("Food")
        setDescription("")
    }

    return <div class="d-flex justify-content-center align-items-center h-100">
        <div class="card shadow-lg w-50 h-100">
            <div class="card-title text-center">
                <h2>Create Item</h2>
            </div>
            <form onSubmit={submit} class="card-body text-center">
                {
                    setForm(["Name","Price","Type","Description"],[name,price,type,description],
                    [setName,setPrice,setType,setDescription],[{},{inputType:"number"},{type:"select",args:["Food","Meat","Ingredient","Other"]},{type:"textarea"}])
                }
                <button type="submit" class="btn btn-dark mt-2">Create</button>
            </form>
        </div>
    </div>
}
const DeleteItem = () => {
    const [{api, native},{setNotification,setItems}] = useUserContext()
    const [id, setId] = createSignal(0)

    //!*
    const submit = async(e:any) => {
        e.preventDefault()
        const idLocal = id()
        if (id() == 0) {
            return undefined
        }
        try{ 
            if(!native()){
                await api.delete(`/item/${id()}`,{withCredentials:true})
            }else{
                await invoke("delete_item", {itemId:id()})
            }
            setNotification(false,"Deleted Item")
            setId(0)
            setItems((x:Array<Item>)=>x.filter((x:Item)=>{
                if (x.id != idLocal){
                    return x
                }
            }))
        }catch(err){
            console.log(err)
            setNotification(true,"Error deleting item")
        }
    }
    return <div class="d-flex justify-content-center align-items-center h-100">
    <div class="card shadow-lg w-50 h-100">
        <div class="card-title text-center">
            <h2>Delete Item</h2>
        </div>
        <form onSubmit={submit} class="card-body text-center">
                <div>
                    <label class="col-12">ID</label>
                    <input type="number" value={id()} onChange={(e:any)=>{
                        setId(parseInt(e.target.value))
                    }} class="col-6" />
                </div>
            <button type="submit" class="btn btn-danger mt-2">Delete</button>
        </form>
    </div>
</div>
}
const AllItems = () => {
    const [{items},{}] = useUserContext()
    return <div class="d-flex justify-content-center align-items-center h-100">
        <div class="card shadow-lg w-50 h-100">
            <div class="card-title text-center">
                <h2>All Item</h2>
            </div>
            <div class="card-body text-center" style={{"height":"70vh", "overflow-y":"scroll"}}>
                {
                    items().map((el:Item)=>{
                        return <ItemCard id={el.id} name={el.name} price={el.price} type={el.type} description={el.description}></ItemCard>
                    })
                }
            </div>
        </div>
    </div>
}
const OtherOptions = () => {
    return <div class="d-flex justify-content-center align-items-center h-100">
        <h1>Coming soon...</h1>
        </div>
}

const ItemCard = (props:{id?:number,name:string,price:number, type:string,description?:string}) => {
  
    return <div class='col-12 mb-2'>
    <div class='card w-100 itemCard'>
        <div class='card-body'>
            <div class='row'>
            <div class='col'>
              ID: {props.id}
            </div>
            <div class='col'>
              Name: {props.name}
            </div>
            <div class='col'>
              Type: {props.type}
            </div>
            <div class='col'>
              Price: $\{props.price?props.price:0}
            </div>
            {props.description?<i class="bi bi-chevron-double-down col-1 btn" data-bs-toggle="collapse" data-bs-target={`#${props.name}${props.id}`.replace(/\s/g, "")} aria-expanded="false" aria-controls="collapseExample"></i>:<></>}
            </div>
        </div>
    </div>
    <div class="collapse" id={`${props.name}${props.id}`.replace(/\s/g, "")}>
        <div class="card card-body">
            {props.description}
        </div>
    </div>
  </div>
  }