import { invoke } from "@tauri-apps/api/tauri";
import {
  Component,
  ComponentProps,
  createSignal,
  onMount,
  Setter,
} from "solid-js";
import { BaseTicket, TicketItem } from "../context/Models";
import { useUserContext } from "../context/UserContext";

interface DataProps extends ComponentProps<any> {
  setOption: (x: string, y: string) => void;
}

const Data: Component = () => {
  const [{ animate, sleep, api, ticket }, { setPathfunc }] = useUserContext();
  const [option, setOption] = createSignal("");
  onMount(async () => {
    setPathfunc();
    animate(false, ".data");
    // let date = ticket().dateTime.split(" ")[0].split("/");
  });
  const set = async (x: string, y: string) => {
    animate(true, y, () => {});
    await sleep(750);
    setOption(x);
  };

  const helper = (option: string) => {
    switch (option) {
      case "a":
        return <Today_Sales setOption={set} />;
        case "b":
            return <Date_Sales setOption={set} />;
      default:
        return <Default setOption={set} />;
    }
  };

  return (
    <div class="data h-100 p-2" style={{ opacity: 0, "overflow-y": "hidden" }}>
      <div class="row d-flex justify-content-center h-100 w-100">
        <div class="col-8 h-100">
          <div class="card h-100 customBack shadow-lg">
            <div class="tab d-flex justify-content-center">
              <h1>Data & Reports</h1>
            </div>
            <div class="card-body h-100">{helper(option())}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Data;

const Default = (props: DataProps) => {
  const [{ animate }, {}] = useUserContext();
  onMount(() => {
    animate(false, ".start");
  });
  return (
    <>
      <div
        class="start row d-flex justify-content-center"
        style={{ opacity: 0 }}
      >
        <div
          onClick={() => {
            props.setOption("a", ".start");
          }}
          class="col-8 btn"
        >
          <div class="card-body shadow-lg h-100">Sales today</div>
        </div>
        <div
          onClick={() => {
            props.setOption("b", ".start");
          }}
          class="col-8 btn"
        >
          <div class="card-body shadow-lg h-100">Sales Search</div>
        </div>
      </div>
    </>
  );
};

const Today_Sales = (props: DataProps) => {
  const [{ animate, orders, ticket, native }, {}] = useUserContext();
  const [total, setTotal] = createSignal(0);
  onMount(() => {
    animate(false, ".today");
    let date = ticket().dateTime.split(" ")[0].split("/");
    let money = 0;
    orders().forEach((x: BaseTicket) => {
        // alot going on here
      let date_string = !native()?`${date[2]}-${
        parseInt(date[0]) < 10 ? "0" + date[0] : date[0]
      }-${date[1]}`:`${date[0]}-${date[1]}-${date[2]}`
      let comparison = native()?x.dateTime.split(" ")[0].replace("/","-").replace("/","-"):x.dateTime.split("T")[0]
      if (date_string == comparison) {
          if (native()){
              //!
              money += x.tax + x.subTotal;
          }else{
              money += x.tax + x.subTotal;
          }
      }
    });
    setTotal(money);
  });
  return (
    <div class="today" style={{ opacity: 0 }}>
      <div class="row">
        <div class="col-5">
          <i
            onClick={() => {
              props.setOption("", ".today");
            }}
            class="col-1 btn bi bi-arrow-left"
          ></i>
        </div>
      </div>
        <div class="text-center">
            <div class="col-12">
            <h2>Sales Today</h2>
            </div>
            <div class="col-12">
            <div>${total()}</div>
            </div>
        </div>
    </div>
  );
};

const Date_Sales = (props: DataProps) => {
    const [{ ticket, animate, native, api }, {}] = useUserContext();
    const [month, setMonth] = createSignal("");
    const [day, setDay] = createSignal("");
    const [year, setYear] = createSignal("");
    const [orders, setOrders] = createSignal<BaseTicket[]>([]);

    onMount(()=>{
        animate(false,".date_sale")
        let date = ticket().dateTime.split(" ")[0].split("/");
        setMonth(date[0])
        setDay(date[1])
        setYear(date[2])
    })

    //! needs to implement native version
    const searchDay = async () => {
        let order_list: BaseTicket[];
        if (native()){
            order_list = await invoke("get_orders_date",{day:day(), month:month(), year:year()});
        }else{
            const result = await api.get("/data/orders/",{withCredentials:true, params:{date:`${year()}-${month()}-${day()}`}})
            order_list = result.data
        }
        order_list.sort((a,b)=>{
        if(a.id > b.id) return 1;
        if(a.id < b.id) return -1;
        return 0;
        })
        setOrders(order_list)
    }
    return <>
        <div class="date_sale h-100" style={{ opacity: 0 }}>
      <div class="row">
        <div class="col-5 h-25">
          <i
            onClick={() => {
              props.setOption("", ".date_sale");
            }}
            class="col-1 btn bi bi-arrow-left"
          ></i>
        </div>
      </div>
        <div class="text-center h-100">
            <div class="col-12">
            <h2>Search for a day</h2>
            </div>
            <div class="col-12">
            <div><input onChange={(e:any) => setMonth(e.target.value)} placeholder={month()} class="date_input" type="text" />/
            <input onChange={(e:any) => setDay(e.target.value)} placeholder={day()} class="date_input" type="text" />/
            <input onChange={(e:any) => setYear(e.target.value)} placeholder={year()} class="date_input" type="text" /></div>
            </div>
            <div class="col-12 mt-3">
                <button onClick={searchDay}class="btn btn-dark">Search</button>
            </div>
            <div class="col-12 mt-2 h-100">
                <div class="card shadow-lg h-75 ticketList" style={{"overflow-x": 'hidden'}}>
                {
                    [...orders()].reverse().map((x: BaseTicket) => {
                        let date;
                        let time
                          if(native()){
                            date = x.dateTime.split(" ");
                            time = date[1]
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
                </div>
            </div>
        </div>
    </div>
    </>
}
