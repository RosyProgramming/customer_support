import "./LoginBox.css";

export default function Loginbox({ setEmail }){
    function login(){
        setEmail("beatriz.costa@example.com");
    }
    return <>
    <div>
        <input></input>
        <button onClick={login}>Login</button>
    </div>
    </>
}