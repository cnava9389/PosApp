import { Component, ComponentProps, createSignal, onMount } from "solid-js";
import { useUserContext } from "../context/UserContext";
import {gsap} from "gsap"
import { BaseTicket, TicketItem } from "../context/Models";
import { invoke } from "@tauri-apps/api/tauri";

interface ModalProps extends ComponentProps<any> {
  // add props here
}

const Modal: Component<ModalProps> = () => {
  const [{ modal,api,orders,round, native}, {setNotification, setForm,setOrders}] = useUserContext();
  const [credit, setCredit] = createSignal(false);
  const [amount, setAmount] = createSignal(0);
  ({amount:-1,id:0,subTotal:-1,tax:-1,credit:false,paid:true});
  const exit = ()=>{
    setAmount(0)
    gsap.timeline({defaults:{duration:1}}).to(".Modal",{y:"-25vh"})
}
const pay = async(e: Event) => {
    e.preventDefault()
    const numb = modal().args![0] as number
    if (amount()>=numb || credit()){
        const form = {
            id:modal().args![1],
            credit:credit(),
            paid:true
        }
        try{
          if (native()){
            await invoke("pay_order",{id:modal().args![1],credit:credit(),paid:true})
          }else{
            await api.put('/order/',form,{withCredentials:true})
          }
            setCredit(false)
            setNotification(false,"Paid order")
            orders().forEach((x:BaseTicket)=>{
                if(x.id == form.id){
                    x.paid = true
                }
            })
        }catch{
            //
        }
    }else{
        gsap.timeline({defaults:{duration:.25}}).to(".PayInput",{y:".5vh",ease:"bounce"}).to(".PayInput",{y:"0vh", ease:"bounce"})
    }
}

  const helper = (option: string) => {
    const secondHelper = () =>{
        const num = modal().args![0] as number
        if (amount()>0){
            return <div>Change due:$\{round(amount() - num)}</div>
        }
        return <></>
    }
    switch (option.toLowerCase()) {
      case "pay":
        return (
          <>
            <div class="card shadow-lg h-125">
              <div class="card-body text-center">
                <div class='row'>
                <h1 class='col-11'>
                  {modal().options.toLowerCase() == "pay"
                    ? "Paying Ticket"
                    : "not yet implemented"}
                </h1>
                <i onClick={exit} class="bi bi-x-lg col-1"></i>
                </div>
                <div class="h3">Total due:$\{`${modal().args![0]}`}</div>
                {secondHelper()}
                <div>
                    {
                        setForm(["paying"],[amount],[setAmount],[{inputType:'number',className:"PayInput"}])
                    }
                </div>
                <button onClick={pay} class="btn btn-primary m-2">pay!</button>
                <label>Credit:</label>
                <input type="checkbox" checked={credit()} onChange={()=>setCredit(x=>!x)}/>
              </div>
            </div>
          </>
        );
        default:
            return <>oops somethings wrong</>
    }
  };
  return <>{helper(modal().options)}</>;
};

export default Modal;
