import User from "../interfaces/User.tsx";
import {Link} from "react-router-dom";

export const Header = (props: {
    user: User|null;
}) => {

    return (
        <header className="App-header">
            <span className="App-header-left">SWIFTRAIL</span>
            { props.user === null ? (
                <Link to="/connection" className="App-header-right" >Se connecter</Link>
            ) : (
                <button className="App-header-right">Voir les informations du profil</button>
            )}
        </header>
    )

}