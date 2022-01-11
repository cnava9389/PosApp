import { Accessor, JSX, Setter } from 'solid-js'
import { Navigator } from "solid-app-router"
import { AxiosInstance, AxiosResponse } from "axios"

export interface BaseUser {
    id: number
    name: string
    ppic: string
    email: string
    phone: string
    street: string
    street2: string
    city: string
    state: string
    zipCode: string
    apt: string 
    auth: string
} 

export interface Item {
    id?: number
    name: string
    price: number
    type: string
    description: string
    custom?: unknown
}

export interface BaseTicket {
    id: number
    credit: boolean
    dateTime: string
    description: string
    employee: string
    items: Array<TicketItem>
    name: string
    paid: boolean
    subTotal: number
    tax: number
    type: string
    Custom?: unknown
}

export class Ticket implements BaseTicket {
    id: number
    credit: boolean
    dateTime: string
    description: string
    employee: string
    items: Array<TicketItem>
    name: string
    paid: boolean
    subTotal: number
    tax: number
    type: string
    Custom?: unknown
    constructor(id: number,description:string ,employee: string, items: Array<TicketItem>,
        name: string, type:string, Custom?: unknown){
            const date = new Date()
            this.id = id
            this.credit = false;
            this.dateTime = `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`
            this.description = description
            this.employee = employee
            this.items = items
            this.name = name
            this.paid = false
            this.subTotal = 0.0
            this.tax = 0.0 
            this.type = type
            if(Custom){
                this.Custom = Custom
            }
        }
}

export interface TicketItem extends Item {
    qty: number
}

export interface Details {
    isError: boolean
    message: string
}

export type Modal = {
    options:string
    message:string
    args?: Array<unknown>
}
export class User implements BaseUser {
    id: number
    name: string;
    ppic: string;
    email: string;
    phone: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    zipCode: string;
    apt: string;
    auth:string;

    constructor(id: number, name: string, ppic: string, email: string, phone: string,
         street: string, street2: string, city: string, state: string, zipCode: string,
         apt: string, auth: string){
            this.id = id
            this.name = name;
            this.ppic = ppic;
            this.email = email;
            this.phone = phone;
            this.street = street;
            this.street2 = street2;
            this.city = city;
            this.state = state;
            this.zipCode = zipCode;
            this.apt = apt;
            this.auth = auth;
         }
}
export interface Config {
    type?: string
    args?: Array<string>
    inputType?: string
    className?:string
    callback?:(x:any)=>void
}

export interface AppState {
    orders: Accessor<Array<BaseTicket>>
    items: Accessor<Array<Item>>
    path: Accessor<string>;
    ticket: Accessor<Ticket> 
    details: Accessor<Details>
    user: Accessor<BaseUser>
    navigate: Navigator
    sleep: (x:number)=> Promise<unknown>
    animate: (exit: boolean, name: string, callback?: Navigator | undefined,
         page?: string | undefined) => Promise<void>
    api: AxiosInstance
    callback: (callback: () => void) => boolean
    loaded: Accessor<boolean>
    modal: Accessor<Modal>
    round: (x:number)=>number
}

export interface AppAction { 
    setOrders: Setter<Array<BaseTicket>>
    setLoaded: Setter<boolean>
    setItems: Setter<Array<Item>>
    setPath: Setter<string>
    setTicket: Setter<Ticket>
    setUser: Setter<BaseUser>
    setDetails: <U extends Details>(v: (U extends Function ? never : U) |
     ((prev: Details) => U)) => U
    setNotification: (isError: boolean, message: string) => void
    setModalAnimation: (option:string, message: string, args?:unknown[]) => void
    setForm: (names: Array<string>, state: Array<Accessor<string | number | string[]>>,
         setState: Array<Setter<string | number | string[]>>, config?: Array<Config>) => JSX.Element
    setPathfunc: ()=>void
    setUpStore: (invoke?: boolean | undefined) => Promise<{
        fetchItems: () => Promise<AxiosResponse<Item[], any>>;
    }[]>
    updateTicket: (currentTotal: number) => void
    setModal: Setter<Modal>
}

export interface AppStore extends Array<AppState | AppAction> {
    0: AppState;
    1: AppAction;
    [Symbol.iterator](): IterableIterator<AppState|AppAction>;
}