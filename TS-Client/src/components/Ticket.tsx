import { Component, ComponentProps} from 'solid-js';
import { TicketItem } from '../context/Models';
import { useUserContext } from '../context/UserContext';

interface TicketProps {
    // add props here
}

const Ticket: Component<TicketProps> = () => {
    const [{ticket},{setTicket}] = useUserContext()
    return (
        <div class='card h-100 shadow-lg'>
            <div class='m-2 row'>
                <div class='col-3'>
                    ID: {ticket().id}
                </div>
                <div class='col-9'>
                    Date & Time: {ticket().dateTime}
                </div>
                <div class='col-6'>
                    Type: {ticket().type}
                </div>
                <div class='col-6'>
                    Paid: {`${ticket().paid}`}
                </div>
                <div class='col-5'>
                    Name: <input value={ticket().name} onChange={(e:any)=>setTicket({...ticket(),name: e.target.value})} type='text'/>
                </div>
            </div>
            <hr/>
            <div class='ticketList m-1'>
                {
                    ticket().items.map((x:TicketItem)=>{
                        return <>
                        <div style={{"height":"7vh"}}>
                            {x.qty} x {x.name}, {x.price}{x.description?`; ${x.description}`:''}
                        </div>
                        </>
                    })
                }
            </div>
            <hr/>
            <div class='row text-center'>
                <div class='col'>
                    <div>Total:</div>
                    <div>{Math.round(((ticket().subTotal+ticket().tax) + Number.EPSILON) * 100) / 100}</div>
                </div>
                <div class='col'>
                    <div>SubTotal:</div>
                    <div>{ticket().subTotal}</div>
                </div>
                <div class='col'>
                    <div>Tax:</div>
                    <div>{ticket().tax}</div>
                </div>
            </div>
        </div>
    )
}

export default Ticket;