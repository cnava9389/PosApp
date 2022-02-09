import { Component, createRenderEffect, onCleanup, onMount } from 'solid-js';
import { Routes, Route, useLocation } from 'solid-app-router';
import {useUserContext} from './context/UserContext'

import "./index.css"
import Home from './pages/Home';
import Login from './pages/Login';
import Notification from './components/Notification';
import Navbar from './components/Navbar';
import CreateAccount from './pages/CreateAccount';
import PageNotFound from './pages/PageNotFound';
import Contact from './pages/Contact';
import CreateOrder from './pages/CreateOrder';
import Settings from './pages/Settings';
import Orders from './pages/Orders';
import Data from './pages/Data';
import Modal from './components/Modal';
import { invoke } from '@tauri-apps/api/tauri'

const App:Component = () => {
  const [{user, navigate, api, sleep, animate, loaded, native, getCookie, socket},
  {setUser, setUpStore, setLoaded, setNative, setOnline, setUpSocket, setNotification}] = useUserContext();

  const helper = (option:boolean) => {
    
    switch (option){
      case true: 
          return <>
            <div class='notification'>
              <Notification/>
            </div>
            <div class="Modal">
              <Modal/>
            </div>
            <Navbar/>
            <div class="app"style={{"height":"90vh"}}>
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/createaccount" element={<CreateAccount/>}/>
              <Route path="/contact" element={<Contact/>}/>
              <Route path="/createorder" element={<CreateOrder/>}/>
              <Route path="/settings" element={<Settings/>}/>
              <Route path="/orders" element={<Orders/>}/>
              <Route path="/data" element={<Data/>}/>
              <Route path="/*all" element={<PageNotFound/>}/>
            </Routes>
            </div>

        </>
      case false:
        return <div class="d-flex justify-content-center align-items-center" style={{"height":"100vh"}}><h1 >Loading...</h1></div>
    }
  }

  createRenderEffect(async()=>{
    const path = useLocation().pathname.toLowerCase();
    await sleep(30)
    if (user().id === -1 ){
      if (!(path == "/createaccount" || path == "/login" || path == "/contact")) {
        navigate("/login")
        //setNotification(true,"please sign in!")
      }
    }
    animate(false,".app")
})
  onMount(async ()=>{
  try{ 
    // window.__TAURI__.
    // invoke("is_native").then(x => setNotification(false,`${x}`)).catch((e)=>setNotification(true,`${e.message}`))
    const isNative:boolean = await invoke("is_native")
    setNative(isNative)


  }catch{  }
  if(!native()){
    try{
      api.defaults.headers.common['Authorization'] = getCookie("POSAPI")||""
      setUpStore(true)
      const result = await api.get("/user/",{withCredentials:true})
      setUser(result.data)
      setUpSocket()
    }catch{
    }
  }else{
      try{ 
          const is_online:boolean = await invoke("is_online")
          setOnline(is_online)
      }catch { }
      try{ 
          await invoke("initiate_db")
          // await invoke("test_fn")
      }catch { console.log('error on test')}
  }
  setLoaded(true)
  })
  onCleanup(() => {
    socket().close()
  })

  return (
  <>
    {
      helper(loaded())
    }
    </>
  );
};

export default App;
