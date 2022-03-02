import { Component, ComponentProps, onMount, createSignal, Accessor } from "solid-js";
import Ticket from "../components/Ticket";
import { BaseTicket, TicketItem } from "../context/Models";
import { useUserContext } from "../context/UserContext";

interface OrdersProps extends ComponentProps<any> {
}

const Orders: Component = () => {
  const [{ animate,orders }, { setPathfunc }] = useUserContext();
  const [option, setOption] = createSignal("a");
  const [rOrders, setRorders] = createSignal<BaseTicket[]>([])
  let one: any, two: any, four: any;
  onMount(() => {
    setPathfunc();
    animate(false, ".orders");
  });
  const tabClick = (e: any) => {
    e.preventDefault();
    one.className = "nav-link";
    two.className = "nav-link";
    four.className = "nav-link";
    e.target.className = "nav-link active";
    setOption(e.target.innerText);
  };
  const listSetter = (option: string) => {
    switch (option) {
      case "All":
        return <All/>;
      case "Paid":
        return <Paid/>;
      case "Un-Paid":
        return <UnPaid/>;
      default:
        return <All/>;
    }
  };
  return (
    <div
      class="orders h-100 p-2 d-flex justify-content-center align-items-center"
      style={{ opacity: 0 }}
    >
      <div class="h-100 w-50 card shadow-lg ticketList customBack">
            <div class="tab d-flex justify-content-center">
              <ul class="nav nav-pills">
                <li class="nav-item">
                  <button ref={one} onClick={tabClick} class="nav-link active">
                    All
                  </button>
                </li>
                <li class="nav-item">
                  <button ref={two} onClick={tabClick} class="nav-link">
                    Paid
                  </button>
                </li>
                <li class="nav-item">
                  <button ref={four} onClick={tabClick} class="nav-link">
                    Un-Paid
                  </button>
                </li>
              </ul>
            </div>
            <div class="m-1">{listSetter(option())}</div>
          </div>
    </div>
  );
};

export default Orders;

const All = () => {
   const [{ native, orders }, { }] = useUserContext();
  const helper = () => {
    switch(orders().length){
        case 0: 
            return <>No orders</>
        default:
            return <>
            {
                [...orders()].reverse().map((x: BaseTicket) => {
                  let date;
                  let time
                    if(native()){
                      date = x.dateTime.split(" ");
                      let split = date[1].split(":")
                      time = `${split[0]}:${parseInt(split[1])<10?`0${split[1]}`:split[1]}`
                    }else{

                      date = x.dateTime.split("T");
                      time = date[1].split(".");
                    }
                    return (
                      <div class="h-50 w-100 card text-center shadow-lg" >
                        <div class="card-title">ID: {x.id}{x.name?` Name: ${x.name}`:''}</div>
                        <div class="card-subtitle">
                          <div className="row">
                            <div>{`${date[0]}; ${!native()?time[0]:time}`}</div>
                          </div>
                          <i
                            class="bi bi-chevron-double-down col-1 btn"
                            data-bs-toggle="collapse"
                            data-bs-target={`#${x.items[0].name}${x.id}`.replace(/\s/g, "")}
                            aria-expanded="false"
                            aria-controls="collapseExample"
                          ></i>
                        </div>
                        <div
                          class="collapse"
                          id={`${x.items[0].name}${x.id}`.replace(/\s/g, "")}
                        >
                          <div class="card card-body">
                            {x.items.map((x: TicketItem) => {
                              return (
                                <>
                                  <div style={{ height: "4vh" }}>
                                    {x.qty} x {x.name}, {x.price}
                                    {x.description ? `; ${x.description}` : ""}
                                  </div>
                                </>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
            }
            </>
    }}
  return (
    <div class="d-flex justify-content-center align-items-center row w-100 m-1">
      {
          helper()
      }
    </div>
  );
};

const UnPaid = (props: OrdersProps) => {
  const [{ round, orders, native }, {setModalAnimation}] = useUserContext();

  const helper = () => {
    const list = orders().filter((x:BaseTicket)=>{return !x.paid}) 
    switch(list.length){
        case 0: 
            return <>All orders paid</>
        default:
            return <>
            {
                list.map((x: BaseTicket) => {
                  let date;
                  let time
                  if(native()){
                    date = x.dateTime.split(" ");
                    let split = date[1].split(":")
                    time = `${split[0]}:${parseInt(split[1])<10?`0${split[1]}`:split[1]}`
                  }else{

                    date = x.dateTime.split("T");
                    time = date[1].split(".");
                  }
                    return (
                      <div class="h-50 w-100 card text-center shadow-lg" >
                        <div class="card-title">ID: {x.id}{x.name?` Name: ${x.name}`:''}</div>
                        <div class="card-subtitle">
                          <div className="row">
                            <div>{`${date[0]}; ${!native()?time[0]:time}`}</div>
                          </div>
                          <i
                            class="bi bi-chevron-double-down col-1 btn"
                            data-bs-toggle="collapse"
                            data-bs-target={`#${x.items[0].name}${x.id}`.replace(/\s/g, "")}
                            aria-expanded="false"
                            aria-controls="collapseExample"
                          ></i>
                        </div>
                        <div
                          class="collapse"
                          id={`${x.items[0].name}${x.id}`.replace(/\s/g, "")}
                        >
                          <div class="card card-body">
                            {x.items.map((x: TicketItem) => {
                              return (
                                <>
                                  <div style={{ height: "4vh" }}>
                                    {x.qty} x {x.name}, {x.price}
                                    {x.description ? `; ${x.description}` : ""}
                                  </div>
                                </>
                              );
                            })}
                            <div>
                                <button onClick={()=>{
                                  console.log(round(x.subTotal+x.tax),x)
                                    if(native()){
                                      //!
                                      setModalAnimation("pay","Paying ticket",[round(x.subTotal+x.tax),x.id])
                                    }else{
                                      setModalAnimation("pay","Paying ticket",[round(x.subTotal+x.tax),x.id])
                                    }
                                }} class="btn btn-primary">pay!</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
            }
            </>
    }}
  return <div class="d-flex justify-content-center align-items-center row w-100 m-1">
  {
      helper()
  }
</div>
};

const Paid = (props: OrdersProps) => {
    const [{ orders, native }, { }] = useUserContext();
    const helper = () => {
        const list = [...orders()].reverse().filter((x:BaseTicket)=>{return x.paid})
        switch(list.length){
            case 0: 
                return <>No paid orders</>
            default:
                return <>
                {
                    list.map((x: BaseTicket) => {
                      let date;
                      let time
                      if(native()){
                        date = x.dateTime.split(" ");
                        let split = date[1].split(":")
                        time = `${split[0]}:${parseInt(split[1])<10?`0${split[1]}`:split[1]}`
                      }else{
                        date = x.dateTime.split("T");
                        time = date[1].split(".");
                      }
                        return (
                          <div class="h-50 w-100 card text-center shadow-lg" >
                            <div class="card-title">ID: {x.id}{x.name?` Name: ${x.name}`:''}</div>
                            <div class="card-subtitle">
                              <div className="row">
                                <div>{`${date[0]}; ${!native()?time[0]:time}`}</div>
                              </div>
                              <i
                                class="bi bi-chevron-double-down col-1 btn"
                                data-bs-toggle="collapse"
                                data-bs-target={`#${x.items[0].name}${x.id}`.replace(/\s/g, "")}
                                aria-expanded="false"
                                aria-controls="collapseExample"
                              ></i>
                            </div>
                            <div
                              class="collapse"
                              id={`${x.items[0].name}${x.id}`.replace(/\s/g, "")}
                            >
                              <div class="card card-body">
                                {x.items.map((x: TicketItem) => {
                                  return (
                                    <>
                                      <div style={{ height: "4vh" }}>
                                        {x.qty} x {x.name}, {x.price}
                                        {x.description ? `; ${x.description}` : ""}
                                      </div>
                                    </>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                }
                </>
        }
        
    }
    return <div class="d-flex justify-content-center align-items-center row w-100 m-1">
    {
        helper()
   }
  </div>
};
