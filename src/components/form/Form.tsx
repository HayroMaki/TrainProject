import {useRef} from "react";
import FormInput from "./FormInput.tsx";

import "../../stylesheets/ConnectionForm.css"

const Form = () => {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    return (
        <div>
            <form>
                <FormInput ref={emailRef} placeholder="your email..."/>
                <FormInput ref={passwordRef} placeholder="your password..."/>
            </form>
        </div>
    )
}
export default Form;