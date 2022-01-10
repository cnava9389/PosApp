import { Component, ComponentProps, onMount } from 'solid-js';
import { useUserContext } from '../context/UserContext';

interface DataProps extends ComponentProps<any> {
    // add props here
}

const Data: Component<DataProps> = () => {
    const [{animate},{setPathfunc}] = useUserContext()

    onMount(()=>{
        setPathfunc()
        animate(false,".data")
    })
    return (
        <div class="data h-100 d-flex justify-content-center align-items-center"
         style={{"opacity":0}}>
            <h2>Data coming soon...</h2>
        </div>
    )
}

export default Data;