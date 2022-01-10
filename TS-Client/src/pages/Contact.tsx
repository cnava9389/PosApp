import { Component, ComponentProps, onMount } from 'solid-js';
import { useUserContext } from '../context/UserContext';

interface ContactProps extends ComponentProps<any> {
    // add props here
}

const Contact: Component<ContactProps> = () => {
    const [{animate},{setPathfunc}] = useUserContext()

    onMount(()=>{
        setPathfunc()
        animate(false,".contact")
    })
    return (
        <div class="contact" style={{"opacity":0}}>
            <h2 >Contact</h2>
        </div>
    )
}

export default Contact;