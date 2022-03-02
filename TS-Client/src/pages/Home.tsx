import { invoke } from '@tauri-apps/api/tauri';
import { Component, ComponentProps, onMount } from 'solid-js';
import { useUserContext } from '../context/UserContext';

interface HomeProps extends ComponentProps<any> {
    // add props here
}

const Home: Component<HomeProps> = () => {
    const [{navigate, animate, user, socket, native, sleep},{setPathfunc, setUpSocket}] = useUserContext()
    onMount(async()=>{
        if (user().name != ""){
            setPathfunc()
            animate(false,".home")
        }
        if (socket().readyState == 1) {
            setUpSocket()
        }else if(socket().readyState != 1 && native()){
            invoke("test_fn")
            await sleep(500)
            setUpSocket()
        }
    })
    return (
        <div class="home h-100" style={{"opacity":0}}>
            <div class='row h-100 laptop-w' style={{"overflow-y":"hidden"}}>
                <div class='col'>
                    <div style='height:45%;width:100%' class='d-flex align-items-center justify-content-center'>
                        <div class='row text-center' onClick={()=>animate(true,".home",navigate,'/createOrder')}>
                            <div class='col-12'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15vh" height="15vh" fill="currentColor" class="bi bi-file-earmark-text-fill" viewBox="0 0 16 16">
                                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1h-4z"/>
                            </svg>
                            </div>
                            <div  class='col-12 h3'>
                                Create Order
                            </div>
                        </div>
                    </div>
                    <hr/>
                    <div style='height:45%;width:100%' class='d-flex align-items-center justify-content-center'>
                    <div class='row text-center' onClick={()=>animate(true,".home",navigate,"/orders")}>
                            <div class='col-12'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15vh" height="15vh" fill="currentColor" class="bi bi-collection-fill" viewBox="0 0 16 16">
                            <path d="M0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zM2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1z"/>
                            </svg>
                            </div>
                            <div class='col-12 h3'>
                                Orders
                            </div>
                        </div>
                    </div>
                </div>
                <div class='col-1 text-center'>
                    <hr class='vr h-100'/>
                </div>
                <div class='col'>
                <div style='height:45%;width:100%' class='d-flex align-items-center justify-content-center'>
                <div class='row text-center' onClick={()=>animate(true,".home",navigate,"/data")}>
                            <div class='col-12'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15vh" height="15vh" fill="currentColor" class="bi bi-graph-up-arrow" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M0 0h1v15h15v1H0V0Zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5Z"/>
                            </svg>
                            </div>
                            <div class='col-12 h3'>
                                Data
                            </div>
                        </div>
                    </div>
                    <hr/>
                    <div style='height:45%;width:100%' class='d-flex align-items-center justify-content-center'>
                    <div class='row text-center' onClick={()=>animate(true,".home",navigate,'/settings')}>
                            <div class='col-12'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15vh" height="15vh" fill="currentColor" class="bi bi-gear-wide-connected" viewBox="0 0 16 16">
                            <path d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434l.071-.286zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5zm0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78h4.723zM5.048 3.967c-.03.021-.058.043-.087.065l.087-.065zm-.431.355A4.984 4.984 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8 4.617 4.322zm.344 7.646.087.065-.087-.065z"/>
                            </svg>
                            </div>
                            <div class='col-12 h3'>
                                Settings
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;