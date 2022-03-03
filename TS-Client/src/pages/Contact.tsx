import { Component, ComponentProps, onMount } from 'solid-js';
import { useUserContext } from '../context/UserContext';
import img1 from '../assets/free-consultation.jpg'

interface ContactProps{
    // add props here
}

const Contact: Component<ContactProps> = () => {
    const [{animate, socket},{setPathfunc}] = useUserContext()

    onMount(()=>{
        setPathfunc()
        animate(false,".contact")
        //!
        // socket().addEventListener("message",(event:MessageEvent) => {
        //     console.log("test ran\n",event)
        //   })
    })
    return (
        <div class="contact h-100 d-flex justify-content-center align-items-center" style={{"opacity":0}}>
            <div class=' w-100 row'>  
            <div class='col-3'>   
            </div>
            <div class='col-6 d-flex justify-content-center align-items-center'>
                <div class='card h-100 w-75'>
                    <img style={{'height':'35vh'}} class='card-img-top' src={img1}/>
                    <div class='text-center card-body'>
                    <div class='card-title'>
                        Christian Nava
                    </div>
                    <div class='card-subtitle'>
                        Software Engineer
                    </div>
                    <hr/>
                    <div>
                        Email: cnava9389@gmail.com
                    </div>
                    <div>
                        Number: 731-394-7332
                    </div>
                    <div>
                        Tambien se habla español
                    </div>
                    </div>
                </div>
            </div>
            <div class='col-3'>
                
            </div>
        </div>
        </div>
    )
}

export default Contact;