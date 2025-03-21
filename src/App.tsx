import { useState } from "react";

function App() {
    const [message, setMessage] = useState<string>("");

    const insertClient = async (name: string, age: number) => {
        if (name == null || ! age) {
            console.log("data error");
            return;
        }
        const response = await fetch("http://localhost:5000/api/insertClient", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, age: age }),
        });

        const data = await response.json();
        setMessage(data.message);
    };

    return (
        <form onSubmit={event => {
            event.preventDefault();

            const name = document.getElementById("name") as HTMLInputElement;
            const ageInput = document.getElementById("age") as HTMLInputElement;
            const age = parseInt(ageInput.value);
            insertClient(name.value, age);
        }}>
            <input type={"text"} id={"name"} required />
            <input type={"number"} id={"age"} required />
            <button type={"submit"}>Insérer</button>
            <p>{message}</p>
        </form>
    );
}

export default App;