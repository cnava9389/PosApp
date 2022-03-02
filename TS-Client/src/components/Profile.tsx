import { onMount, Setter } from "solid-js";
import { useUserContext } from "../context/UserContext";

interface ProfileProps {
    setOption:(x: string) => void
}

function Profile(props: ProfileProps) {
    const [{animate, user},{setPathfunc}] = useUserContext()
    onMount(()=>{
        setPathfunc()
        animate(false,".profile")
    })
    return (
        <>
        <div class="profile h-100 p-2" style={{"opacity":0, "overflow-y":"hidden"}}>
        <div class="row d-flex justify-content-center h-100 w-100">
          <div class="col-8 h-100">
            <div class="card h-100 customBack shadow-lg">
              <div class="tab d-flex justify-content-center">
                    <div class="col-5"><i onClick={()=>{
                    props.setOption("x")
                }} class="col-1 btn bi bi-arrow-left"></i></div>
                <div class="col-6">
                    <h1>Profile</h1>
                </div>
              </div>
              <div class="card-body h-100">
                    <div class="row text-center">
                            <div class="col-6 mb-3"><label class='col-6'>Name:</label> <input value={user().name} placeholder={user().name||"ex.. John Apple"} class='col-6' type="text" /></div>
                            <div class="col-6 mb-3"><label class='col-6'>Email:</label> <input value={user().email} placeholder={user().email || "ex.. example@test.com"} class='col-6' type="text" /></div>
                            <div class="col-6 mb-3"><label class='col-6'>Business:</label> <input value={user().business} placeholder={user().business||"ex.. Dunder Miflin"} class='col-6' type="text" /></div>
                            <div class="col-6 mb-3"><label class='col-6'>Phone:</label> <input value={user().phone} placeholder={user().phone||"ex.. 12345678900"} class='col-6' type="text" /></div>
                            <div class="col-6 mb-3"><label class='col-6'>City:</label> <input value={user().city} placeholder={user().city||"ex.. Atlanta"} class='col-6' type="text" /></div>
                            <div class="col-6 mb-3"><label class='col-6'>State:</label> <input value={user().state} placeholder={user().state || "ex.. TN"} class='col-6' type="text" /></div>
                            <div class="col-6 mb-3"><label class='col-6'>Street:</label> <input value={user().street} placeholder={user().street||"ex.. 123 apple ave"} class='col-6' type="text" /></div>
                            <div class="col-6 mb-3"><label class='col-6'>Street 2:</label> <input value={user().street2} placeholder={user().street2||"ex.. apt 4"} class='col-6' type="text" /></div>
                            <div class="col-6 mb-3"><label class='col-6'>Zip Code:</label> <input value={user().zipCode} placeholder={user().zipCode||"ex.. 12345"} class='col-6' type="text" /></div>
                            <div class="col-6 mb-3"><label class='col-6'>Code:</label> <input value={user().businessCode} placeholder={user().businessCode||"ex.. r123abc"} class='col-6' type="text" /></div>
                            <div class="col-12 mb-3 mt-3"><button class="btn btn-dark w-50">Update</button></div>
                    </div>
              </div>
            </div>
          </div>
        </div>
      </div>
              </>
    )
}

export default Profile;