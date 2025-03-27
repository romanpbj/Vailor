import { useState, useEffect, useContext } from 'react';
import axios from "axios";
import { AuthContext } from "../AuthContext";


function AccountSettings(){

    const { user } = useContext(AuthContext)
    const[username, setUsername] = useState("")
    const[message, setMessage] = useState("")
    const[files, setFiles] = useState([])
    const[name, setName] = useState("")
    const[street1, setStreet1] = useState("")
    const[street2, setStreet2] = useState("")
    const[city, setCity] = useState("")
    const[state, setState] = useState("")
    const[zip, setZip] = useState("")
    const[country, setCountry] = useState("US")
    const[message2, setMessage2] = useState("")
    const[phone, setPhone] = useState("")
    const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

    useEffect(() => {
        axios.get(`${API_URL}/api/user`)
          .then(response => {
            const data = response.data
            setUsername(data.username);
          })
          .catch(err => console.error("Error fetching username:", err));
    }, [user.id]);

    function handleChange(e){
        e.preventDefault()
        const updatedData = {"newName" : username}

        axios.put(`${API_URL}/api/user`, updatedData)
        .then(response => {
            setUsername(response.data.username)
            setMessage(`Changed name to ${username}`)
        })
        .catch(err => setMessage("Error changing name:" + err))
    }

    const handleFileChange = (e) => {
        setFiles(e.target.files);
      };

    function handleProfile(){

        const formData = new FormData()
        formData.append("image", files[0])
        formData.append("user_id", user.id)

        axios.post(`${API_URL}/api/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
    }

    function handleAddress() {

        setCountry("US")
        const AddressData = {
            name, street1, street2, city, state, zip, country, phone
        }

        axios.put(`${API_URL}/api/user/address`, AddressData)
        .then(response => {
            setMessage2("Address created")
        })
        .catch(err => setMessage2("Error updating/creating address"))

    }


    return (
        <div>
            <h1>Settings</h1>
            <div>
                <form onSubmit={handleChange}>
                    <label>Change Username</label><br></br>
                    <input type='text' value={username} onChange={(e) => setUsername(e.target.value)}></input>
                    <button type='submit'>Change</button>
                </form>
            </div>
            <p>{message}</p>
            <div>
            <br></br>
            <form onSubmit={handleProfile}>
                <label>Upload Profile Image:</label>
                <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                />
                <br></br>
                <button type='submit'>Upload Profile Picture</button>
            </form>
            <br></br>
            <div>
                <form onSubmit={handleAddress}>
                    <label>Set Address:</label><br></br>
                    <label>Name:</label>
                    <input type='text' value={name} onChange={(e) => setName(e.target.value)}></input>
                    <br></br>
                    <label>Street 1:</label>
                    <input type='text' value={street1} onChange={(e) => setStreet1(e.target.value)}></input>
                    <br></br>
                    <label>Street 2:</label>
                    <input type='text' value={street2} onChange={(e) => setStreet2(e.target.value)}></input>
                    <br></br>
                    <label>City:</label>
                    <input type='text' value={city} onChange={(e) => setCity(e.target.value)}></input>
                    <br></br>
                    <label>State:</label>
                    <input type='text' value={state} onChange={(e) => setState(e.target.value)}></input>
                    <br></br>
                    <label>Zip Code:</label>
                    <input type='text' value={zip} onChange={(e) => setZip(e.target.value)}></input>
                    <br></br>
                    <label>Phone Number:</label>
                    <input type='text' value={phone} onChange={(e) => setPhone(e.target.value)}></input>
                    
                    <button type='submit'>Update Address</button>
                </form>
                <p>{message2}</p>
            </div>
            </div>
        </div>
    )
}

export default AccountSettings