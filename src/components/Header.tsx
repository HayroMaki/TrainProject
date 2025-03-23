import User from "../interfaces/User.tsx";
import {Link} from "react-router-dom";

export const Header = (props: {
    user: User|null;
}) => {

    return (
        <header className="App-header">
            <span className="App-header-left">SWIFTRAIL</span>
            { props.user === null ? (
                <button className="App-header-right">Se connecter</button>
            ) : (
                <button className="App-header-right"><Link to="/Connection" >Voir les informations du profil</Link></button>
            )}
        </header>
    )

}