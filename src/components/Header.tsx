import {Link, NavLink} from "react-router-dom";
import {useUserContext} from "./UserContext.tsx";

export const Header = () => {
    const {connected} = useUserContext();

    return (
        <header className="App-header">
            <NavLink to={"/"} className="App-header-left">SWIFTRAIL</NavLink>
            { !connected ? (
                <NavLink to={"/connection"} className="App-header-right">Se connecter</NavLink>
            ) : (
                <NavLink to={"/cart"} className="App-header-right"><Link to="/connection" >Voir les informations du profil</Link></NavLink>
            )}
        </header>
    )

}