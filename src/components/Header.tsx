import User from "../interfaces/User.tsx";

export const Header = (props: {
    user: User|null;
}) => {

    return (
        <header className="App-header">
            <span className="App-header-left">SWIFTRAIL</span>
            { props.user === null ? (
                <button className="App-header-right">Se connecter</button>
            ) : (
                <button className="App-header-right">Voir les informations du profil</button>
            )}
        </header>
    )

}