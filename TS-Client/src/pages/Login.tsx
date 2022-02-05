import { Component, ComponentProps, createSignal, onMount } from 'solid-js';
import { BaseUser } from '../context/Models';
import { useUserContext } from '../context/UserContext'

interface LoginProps extends ComponentProps<any> {
    // add props here
}

const Login: Component<LoginProps> = (props: LoginProps) => {
    const [{navigate, animate, api, native, user},{setForm, setNotification, setUser, setPathfunc,setUpStore, setCookie}] = useUserContext()
    const [email, setEmail] = createSignal<string>("")
    const [password, setPassword] = createSignal<string>("")
    
    const login = async(e: Event) => {
        e.preventDefault()
        const form = {
            email: email(),
            password: password()
        }
        try{
            const result = await api.post("/login",form,{withCredentials:true, params:{native:native()}})
            setUser(result.data.user)
            api.defaults.headers.common['Authorization'] = result.data.api_key;
            setCookie("POSAPI", result.data.api_key, 8)
            setNotification(false,"Logged in!")
            setUpStore(true)
            animate(true,".login",navigate,"/")
        }catch(err){
            setNotification(true,"Error logging in!")
        }
    }

    onMount(()=>{
        setPathfunc()
        animate(false,".login")
    })

    return (
        <div class="d-flex justify-content-center align-items-center h-100 login">
            <div class="card shadow-lg w-50">
                <div class="card-title text-center">
                    <h2>Login</h2>
                </div>
                <div class="card-body">
                    <div class="row text-center">
                        <form onSubmit={login}>
                        { 
                            setForm(["Email","Password"],[email, password],[setEmail, setPassword])
                        }
                        <div class="mt-2">
                            <button type="submit" class="btn btn-dark col-6"> Log In</button>
                        </div>
                        </form>
                        <div class="mt-2">
                            <button onClick={()=>animate(true,".login",navigate,"/createaccount")} class="btn btn-dark col-6"> Create Account</button>
                        </div>
                        {
                            native()?<div class="mt-2">
                            <button onClick={()=>{
                                setUser({...user(),id:0, name: 'local'})
                                setNotification(false,"Logged in!")
                                setUpStore(true)
                                animate(true,".login",navigate,"/")
                            }} class="btn btn-dark col-6">Local</button>
                        </div>:<></>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;