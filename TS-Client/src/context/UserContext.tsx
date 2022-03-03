import { createContext, createSignal, useContext, Component, ComponentProps, JSX, Accessor, Setter, onMount} from "solid-js";
import { AppStore, Details, BaseUser, User, Ticket, Config, Item, Modal, BaseTicket, MetaData} from './Models'
import { gsap } from 'gsap'
import { useNavigate, Navigator, useLocation } from "solid-app-router"
import axios,{AxiosResponse} from "axios"
import { invoke } from '@tauri-apps/api/tauri'


interface UserProviderProps extends ComponentProps<any> {
    // add props here
}
const date = new Date()
export const testUser = new User(-1,"","","","","","","","","","","","","")
export const testTicketItem = {qty:1,name:"Taco",price:0.0,description:"something",type:"food",id:-1}
export const testTicket = {id:-1,credit:false,dateTime:`${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`,description:"",
employee:"",items:[],name:"",paid:false,subTotal:0.0,tax:0.0,type:"pickup"}


const [navigate, setNavigate] = createSignal<Navigator>()
const [details, setDetails] = createSignal<Details>({isError:false,message:""})
const [user, setUser] = createSignal<BaseUser>(testUser)
const [ticket, setTicket] = createSignal<Ticket>(testTicket)
const [path, setPath] = createSignal<string>("")
const [items, setItems] = createSignal<Array<Item>>([])
const [loaded, setLoaded] = createSignal(false)
const [salesTax, setSalesTax] = createSignal(.0975)
const [orders, setOrders] = createSignal<Array<BaseTicket>>([])
const [modal,setModal] = createSignal<Modal>({options:"",message:"",args:[]})
const [native, setNative] = createSignal<boolean>(false);
const [online, setOnline] = createSignal<boolean>(true);
// const [localDB, setLocalDB ] = createSignal<boolean>(true);
const [metaData, setMetaData] = createSignal<MetaData>({isNative:false,localDataBase:true})
const [socket, setSocket] = createSignal<WebSocket>({} as WebSocket)
const [socketSet, setSocketSet] = createSignal(false)

const setUpSocket = async() => {
    if (!socketSet()){
        try{            
            socket().addEventListener("open", ()=>{
                // socket().send("Hello")
                console.log("opened")
            })
            //! types
            socket().addEventListener("message", (event)=>{
                let message = JSON.parse(event.data)
                switch (message.type) {
                    case "ERROR":
                        console.log("error\n",message)
                    break;
                    case "ECHO":
                        console.log(message)
                        let command = JSON.parse(message.data)
                        switch (command.type) {
                        case "CREATE_ORDER":
                            console.log("creating order\n",command.data)
                            setOrders([...orders(), command.data ])
                            break;
                        case "CREATE_ITEM":
                            console.log("creating item\n",command.data)
                            setItems(x=>[...x,command.data])
                            break;
                        case "DELETE_ITEM":
                            console.log("deleting item\n",command.data)
                            setItems((x:Array<Item>)=>x.filter((x:Item)=>{
                                if (x.id != command.data){
                                    return x
                                }
                            }))
                            break;
                        default:
                            console.log("unknown case")
                            break;
                    }
                    break;
                    case "JOIN":
                    console.log(message.data)
                    break;
                case "UNAME":
                    console.log(`name has been set to ${message.data}`)
                    break;
                case "RNAME":
                    console.log(message.data)
                    break;
                default:
                    console.log("did not find case\n",message)
                    break;
                }
            })
            
            socket().addEventListener("error", (event)=>{
                console.log("error occurred\n",event)
            })
            await sleep(150)
            socket().send(JSON.stringify({type:"UNAME",data:`${user().name}${Math.random()*100}`}))
            socket().send(JSON.stringify({type:"JOIN",data:user().businessCode}))
            // socket().send(JSON.stringify({type:"ERROR",data:user().businessCode}))
        }catch(err){
            console.log(err)
        }
        setSocketSet(true)
        }
    }

function setCookie(name:string,value:string,days:number) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name:string) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name:string) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

const setNotification = (isError:boolean, message:string) => {
    setDetails({isError:isError,message:message})
    gsap.timeline({defaults:{duration:2}}).to(".notification",{y:"25vh", ease:'bounce'}).to(".notification",{y:"-25vh", delay:3})
}
const setModalAnimation = (options:string, message:string, args?:unknown[]) => {
    setModal({options, message, args})
    gsap.timeline({defaults:{duration:1}}).to(".Modal",{y:"25vh"})
}
const updateTicket = (currentTotal:number) => {
    const newSubTotal = Math.round(((currentTotal + ticket().subTotal) + Number.EPSILON) * 100) / 100;
    const newTax = Math.round(((newSubTotal*salesTax()) + Number.EPSILON) * 100) / 100;
    setTicket({...ticket(),subTotal:newSubTotal,tax:newTax})
}

const setForm = (names:Array<string>, state:Array<Accessor<string | number | string[]>>,  setState: Array<Setter<string | number | string[]>>, config?: Array<Config>): JSX.Element => {
    {
        if (names.length <=4) {
             return names.map((el, i) => {
                if (!config){
                    return <div>
                        <label class="col-12">{el}</label>
                        <div class="d-flex justify-content-center">
                            <input class="col-6" type={el.toLowerCase() == "password"?"password":(el.toLowerCase() == "email"?"email":"text")} value={state[i]()} onInput={(e:any)=>setState[i](e.target.value)}/>
                        </div>
                </div>
                }else{
                    if(!config[i].type && !config[i].inputType){
                        return <div>
                            <label class="col-12">{el}</label>
                            <div class="d-flex justify-content-center">
                                <input class="col-6" type={el.toLowerCase() == "password"?"password":(el.toLowerCase() == "email"?"email":"text")} value={state[i]()} onInput={(e:any)=>setState[i](e.target.value)}/>
                            </div>
                    </div>
                    }
                    switch(config[i].type){
                        case "select":
                            return <div>
                            <label class="col-12">{el}</label>
                            <div class="d-flex justify-content-center">
                                <select class="col-6" required  value={state[i]()} onChange={(e:any)=>setState[i](e.target.value)}>
                                    {
                                        config[i].args!.map(e=>{
                                            return <option value={e}>{e}</option>
                                        })
                                    }
                                </select>
                            </div>
                            </div>
                        case "textarea":
                            return <>
                            <label class="col-12">{el}</label>
                            <div class="d-flex justify-content-center">
                                <textarea class="col-8" rows="4" value={state[i]()} onInput={(e:any)=>setState[i](e.target.value)}></textarea>
                            </div>
                            </>
                        default:
                            return <div>
                            <label class="col-12">{el}</label>
                            <div class={`d-flex justify-content-center ${config[i].className}`}>
                                {config[i].inputType=="number"?<input class="col-6" type="number" max="9999" step=".01" value={state[i]()} onInput={(e:any)=>setState[i](parseFloat(e.target.value))}/>:
                                <input onInput={(e:any)=>setState[i](parseFloat(e.target.value))} class="col-6" type={config[i].inputType == "password"?"password":(config[i].inputType == "email"?"email":"text")}  />}
                            </div>
                    </div>
                            
                    }
                }
            })
        }else {
             return names.map((el,i) => {
                return <div class="col-6">
                <label class="col-12 m-2">{el}</label>
                <input class="col-12 m-2" type={el.toLowerCase() == "password"?"password":(el.toLowerCase() == "email"?"email":"text")} value={state[i]()} onChange={(e:any)=>setState[i](e.target.value)}/>
            </div>
            })
        }
    }
}

function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const animate = async(exit:boolean,  name:string, callback?: Navigator, page?:string) => {
    if (exit) {
        gsap.timeline({defaults:{duration:.5}}).to(name,{opacity:0})
        await sleep(1050)
        callback!(page!)
    }else{
        gsap.timeline({defaults:{duration:1}}).to(name,{opacity:1})
    }
}

const api = axios.create({
    baseURL: `${import.meta.env.VITE_POSAPI}`
})

const callback = (callback:()=>void):boolean => {
    try{
        callback()
        return true
    }catch{
        return false
    }
}

const setPathfunc = () => {
    setPath(useLocation().pathname.toLowerCase())
}
const round = (x:number)=>{
    return Math.round((x + Number.EPSILON) * 100) / 100
}

//!*
const fetchItems = (): Promise<unknown> => {
    if(native()){
        return invoke("get_items")
    }
    return api.get<any, AxiosResponse<Item[],any>>("/item/",{withCredentials:true})
}
//!*
const fetchOrders = (): Promise<AxiosResponse<Ticket[], any>> => {
    if(native()){
        return invoke("get_orders")
    }
    return api.get<any, AxiosResponse<Array<Ticket>,any>>("/order/",{withCredentials:true})
}
// const fetchUser = () => { return api.get<any, AxiosResponse<User,any>>("/user/",{withCredentials:true})}
//!*
const setUpStore = async(invoke?:boolean) => {
    if(invoke){
        try{ 
        
            let result = await fetchItems() as AxiosResponse<Array<Item>,any> | Array<Item>
            let result2 = await fetchOrders() as AxiosResponse<Array<BaseTicket>,any> | Array<BaseTicket>

            result = result.data?result.data:result 
            result2 = result2.data?result2.data:result2 
            result2 = result2 as Array<BaseTicket>

            result2.sort((a,b)=>{
                if(a.id > b.id) return 1;
                if(a.id < b.id) return -1;
                return 0;
            })
            setItems(result as Array<Item>)
            setOrders(result2 as Array<BaseTicket>)
            setTicket(new Ticket(-1,"","",[],"","pickup"))

        }catch(err){
            console.log(err)
            // setNotification(true,"Error recieving data! please ask for help")
        }
        
    }
    return [{fetchItems,fetchOrders}]
}

const store:AppStore = [{
    details,
    user,
    navigate,
    sleep,
    animate,
    api,
    ticket,
    callback,
    path,
    items,
    loaded,
    orders,
    modal,
    round,
    native,
    online,
    metaData,
    getCookie,
    eraseCookie,
    socket
},{
    setDetails,
    setUser,
    setNotification,
    setForm,
    setTicket,
    setPath,
    setPathfunc,
    setItems,
    setUpStore,
    setLoaded,
    updateTicket,
    setOrders,
    setModalAnimation,
    setModal,
    setOnline,
    setNative,
    setMetaData,
    setCookie,
    setSocket,
    setUpSocket
}]

const UserContext = createContext<AppStore>(store)

export const UserProvider: Component<UserProviderProps> = (props: UserProviderProps) => {
const navigate = useNavigate();

onMount(()=>{
    setNavigate(_=>navigate)
})

    return (
        <UserContext.Provider value={[{...store[0],navigate},{...store[1]}]}>
            {props.children}
        </UserContext.Provider>
    )
}

export const useUserContext = () => {return useContext(UserContext)};