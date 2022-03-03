import { Component, ComponentProps, createSignal, onMount } from 'solid-js';
import { useUserContext } from '../context/UserContext';

interface CreateAccountProps {
    // add props here
}

const CreateAccount: Component<CreateAccountProps> = (props: CreateAccountProps) => {
    const [{animate, api, navigate, native},{setForm, setNotification, setUser, setPathfunc, setCookie}] = useUserContext()
    const [email, setEmail] = createSignal<string>("")
    const [name, setName] = createSignal<string>("")
    const [password, setPassword] = createSignal<string>("")
    const [business, setBusiness] = createSignal<string>("")
    const [phone, setPhone] = createSignal<string>("")
    const [businessCode, setBusinessCode] = createSignal<string>("")
    const createAccount = async(e:Event) => {
        e.preventDefault();
        const form = {
            email: email(),
            name: name(),
            password: password(),
            business: business(),
            phone: phone(),
            businessCode: businessCode(),
        }
        try{ 
            const result = await api.post("/user/",form,{withCredentials:true, headers: {'Content-Type': 'application/json'}, params:{native:native()}})
            setUser(result.data.user)
            api.defaults.headers.common['Authorization'] = result.data.api_key;
            setCookie("POSAPI", result.data.api_key, 8)
            setNotification(false,"Created account!")
            animate(true,".create",navigate,"/")
        }catch(err){
            setNotification(true,"Error creating account")
        }
    }

    onMount(()=>{
        setPathfunc()
        animate(false,".create")
    })

    return (
        <div style={{"opacity":0}} class="d-flex justify-content-center align-items-center h-100 create">
            <div class="card shadow-lg w-50">
                <div className="card-title text-center">
                    <h2>Create Account</h2>
                </div>
                <div className="card-body">
                    <div className="row text-center">
                    <form class="row" onSubmit={createAccount}>
                        {
                            setForm(["Email","Name","Password","Business","Phone","Code"],
                            [email,name,password,business,phone,businessCode],[setEmail,setName,setPassword,setBusiness,setPhone,setBusinessCode])
                        }
                        <div className="mt-2">
                            <button type="submit" className="btn btn-dark col-6">Create</button>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateAccount;