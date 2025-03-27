import { useContext } from "react";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import '../NavBar.css'

function Logout(){
    const { logoutUser } = useContext(AuthContext)
    const navigate = useNavigate()

    function handleLogout(){
        logoutUser()
        navigate("/login")
    }

    return (
        <button className='logout-btn' onClick={handleLogout}>Logout</button>
    )
}



export default Logout