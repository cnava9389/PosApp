import { Component, ComponentProps } from 'solid-js';
import { useUserContext } from '../context/UserContext';


const Notification: Component = () =>  {
    const [{details},{}] = useUserContext()
    return (
        <>
        <div class='card' style={{'background-color':`${!details().isError?'lightgreen':'#dd4b40'}`}}>
        <div class='card-body text-center'>
            <h1>{details().isError?'Error':'Success'}</h1>
            <div class='h3'>
                { details().message }
            </div>
        </div>
    </div>
    </>
    )
}

export default Notification;