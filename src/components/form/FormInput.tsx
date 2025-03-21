import {Ref} from "react";

const FormInput = (props:{
    ref:Ref<HTMLInputElement>,
    placeholder:string},
) => {
    return (
        <div className="form-input">
            <label></label>
            <input ref={props.ref} placeholder={props.placeholder}/>
        </div>
    )
}
export default FormInput;