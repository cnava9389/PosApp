import { Component, ComponentProps, createSignal, onMount } from 'solid-js';
import Calculator from '../components/Calculator';
import Menu from '../components/Menu';
import Ticket from '../components/Ticket';
import { useUserContext } from '../context/UserContext';

interface CreateOrderProps{
    // add props here
}

const CreateOrder: Component<CreateOrderProps> = () => {
    const [{animate},{setPathfunc}] = useUserContext()
    const [qty, setQty] = createSignal(0)
    const [metaData, setMetaData] = createSignal<any>({})
    onMount(()=>{
        setPathfunc()
        animate(false,".createOrder")
    })
    return (
        <div class="h-100 createOrder p-2">
           <div style={{"height":"80vh"}} class='row posContainer laptop-w'>
            <div class='col-3'>
                    <Ticket/>
                </div>
                <div class='col'>
                    <Menu qty={qty} metaData={metaData} setMetaData={setMetaData} setQty={setQty}/>
                </div>
                <div class='col-3'>
                    <Calculator qty={qty} metaData={metaData} setQty={setQty}/>
                </div>
           </div>
           <div>
           </div>
        </div>
    )
}

export default CreateOrder;