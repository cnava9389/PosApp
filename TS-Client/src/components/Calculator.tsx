import { invoke } from '@tauri-apps/api/tauri';
import { AxiosResponse } from 'axios';
import { Component, ComponentProps, Accessor, Setter } from 'solid-js';
import { TicketItem, BaseTicket, MetaData } from '../context/Models';
import { useUserContext, testTicket } from '../context/UserContext';

interface CalculatorProps {
    qty: Accessor<number>
    setQty: Setter<number>
    metaData: Accessor<any>
}

const Calculator: Component<CalculatorProps> = (props: CalculatorProps) => {
    const [{ticket, api, orders, round, native, socket},{setTicket, updateTicket, setNotification, setOrders, setModalAnimation}] = useUserContext()
    const addInput = (x: number): undefined =>{
        props.qty()!=0?props.setQty(y=>parseInt(`${y}${x}`)):props.setQty(x)
        return undefined
    }
    const delItemFromTicket= ():void =>{
        let amounts:number[] = []
        ticket().items[ticket().items.length - 1].description.split(',').forEach((x:string)=>{
            const sub = x.split(" ")
            if (sub[2]=="yes"||sub[2]=="con"){
                if(sub.length==4){
                    //no money
                }else if (sub.length==5){
                    // 1 word item with money
                    amounts.push(props.metaData()[`${sub[sub.length - 1]}`])
                }else if (sub.length==6){
                    // 2 word item with money
                    amounts.push(props.metaData()[`${sub[sub.length - 2]} ${sub[sub.length - 1]}`])
                }
                else{ 
                    console.log("unknown case", sub)
                }
            }}
        )
        amounts.forEach((x:number)=>{
            console.log(x)
            if(x){
                updateTicket(-x)
            }
        })
        const last = ticket().items[ticket().items.length - 1]
        updateTicket(-(last.price*last.qty))
        setTicket({...ticket(),items:[...ticket().items.slice(0,-1)]})
    }
    const pay = () => {setModalAnimation("pay","Paying ticket",[round(ticket().subTotal+ticket().tax),ticket().id])}
    //!*
    const createOrder = async() => {
        // let strList = ""
        // ticket().items.forEach((x:TicketItem) => strList += `${JSON.stringify(x)},`)       
        
        try{ 
            //! type
            let s_ticket
            if(native()){
                const id:number = await invoke("create_order", {...ticket(),jsType:ticket().type})
                s_ticket = {...ticket(),id:id}
                setOrders([...orders(), s_ticket])


            }else{
                const result = await api.post("/order/",ticket(),{withCredentials:true})
                s_ticket = result.data
                setOrders([...orders(),s_ticket ])
            }
            setNotification(false,"Created Order")
            setTicket(testTicket)
            socket().send(JSON.stringify({type:"ECHO", data:JSON.stringify({type:"CREATE_ORDER", data:s_ticket})}))
        }catch(err){
            console.log(err)
            setNotification(true,"Error creating order")
        }
    }
    const fillerTicket = testTicket
    return (
        <>
        <div class='h-75 d-flex justify-content-center align-items-center m-0 p-0'>
            <div class='calcContainer card shadow-lg'>
                <div class='m-1 row'>
                <label class=' m-0 col-4'>Qty:</label>
                <input class='col m-1' disabled value={props.qty()}/>
                </div>
                <hr/>
                <div class='row w-100 btnFix gap-.5'>
                    <div class='col-4 btnContainer text-center'>
                        <button class='btn btn-dark w' onClick={()=>addInput(7)}>7</button>
                    </div>
                    <div class='col-4 btnContainer text-center'>
                        <button class='btn btn-dark w' onClick={()=>addInput(8)}>8</button>
                    </div>
                    <div class='col-4 btnContainer text-center'>
                        <button class='btn btn-dark w' onClick={()=>addInput(9)}>9</button>
                    </div>
                    <div class='col-4 btnContainer text-center'>
                        <button class='btn btn-dark w' onClick={()=>addInput(4)}>4</button>
                    </div>
                    <div class='col-4 btnContainer text-center'>
                        <button class='btn btn-dark w' onClick={()=>addInput(5)}>5</button>
                    </div>
                    <div class='col-4 btnContainer text-center'>
                        <button class='btn btn-dark w' onClick={()=>addInput(6)}>6</button>
                    </div>
                    <div class='col-4 btnContainer text-center'>
                        <button class='btn btn-dark w' onClick={()=>addInput(1)}>1</button>
                    </div>
                    <div class='col-4 btnContainer text-center'>
                        <button class='btn btn-dark w' onClick={()=>addInput(2)}>2</button>
                    </div>
                    <div class='col-4 btnContainer text-center'>
                        <button class='btn btn-dark w' onClick={()=>addInput(3)}>3</button>
                    </div>
                    <div class='col-4 btnContainer text-center'>
                        <button class='btn btn-dark w' onClick={()=>props.setQty(0)}>C</button>
                    </div>
                    <div class='col-4 text-center'>
                        <button class='btn btn-dark w' onClick={()=>addInput(0)}>0</button>
                    </div>
                    <div class='col-4 text-center'>
                        <button onClick={delItemFromTicket} class='btn btn-dark w' >{'<-'}</button>
                    </div>
                </div>
                <div class='row m-1 d-flex justify-content-center'>
                    <div class='col-5'>
                        <label class='m-1'>Credit: </label>
                        <input onClick={()=>setTicket({...ticket(),credit:ticket().credit?false:true})} type='checkbox' checked={ticket().credit}/>
                    </div>
                </div>
            </div>
        </div>
            <div class='row'>
                <div class='col-12 d-flex justify-content-center mb-md-3'>
                <button onClick={pay} class='btn btn-success'>Pay</button>
                </div>
                <div class='col-12 d-flex justify-content-center mb-md-3'>
                <button onClick={createOrder} class='btn btn-dark'>Send</button>
                </div>
                <div class='col-12 d-flex justify-content-center'>
                <button onClick={()=>setTicket(fillerTicket)} class='btn btn-danger w-50'>Clear Ticket</button>
                </div>
            </div>
       </>
    )
}

export default Calculator;