import { Component, ComponentProps, onMount, createSignal, Setter} from 'solid-js';
import { useUserContext } from '../context/UserContext';
import {Item} from "../context/Models"
import { AxiosResponse } from 'axios';
import { invoke } from '@tauri-apps/api/tauri'
import Items from '../components/Items';
import Profile from '../components/Profile';


interface SettingsProps extends ComponentProps<any> {
    setOption:Setter<string>
}

//! maybe add some actual settings

const Settings: Component = () => {
    const [{animate},{setPathfunc}] = useUserContext()
    onMount(()=>{
        setPathfunc()
        animate(false,".setting")
    })

    const [option, setOption] = createSignal('x')

    const set = (x:string) => {
        setOption(x)
        animate(false,".setting")
    }

    const settingSetter = (option:string) => {
        switch (option){
            case 'Items':
              return <Items setO={set}/>
            case "Profile":
                return <Profile setOption={set}/>
            case "x":
                return <Default setOption={setOption}/>
            default:
              return <Default setOption={setOption}/>
        }
    }

    return (
        <>
        {
            settingSetter(option())
        }
        </>
    );
}

export default Settings;


const Default = (props:SettingsProps) => {
    return <>
    <div class="setting h-100 p-2" style={{"opacity":0, "overflow-y":"hidden"}}>
    <div class="row d-flex justify-content-center h-100 w-100">
      <div class="col-8 h-100">
        <div class="card h-100 customBack shadow-lg">
          <div class="tab d-flex justify-content-center">
                <h1>Settings</h1>
          </div>
          <div class="card-body h-100">
                <div class="row d-flex justify-content-center">
                    <div onClick={()=>props.setOption("Items")} class="col-8 btn">
                        <div class="card-body shadow-lg h-100">
                            Items
                        </div>
                    </div>
                    <div onClick={()=>props.setOption("Profile")} class="col-8 btn mt-3">
                        <div class="card-body shadow-lg h-100">
                            Profile
                        </div>
                    </div>
                </div>
          </div>
        </div>
      </div>
    </div>
  </div>
          </>
}