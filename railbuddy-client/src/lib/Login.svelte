<script>
	import { Styles, Form, FormGroup, Input, Button, Label } from "sveltestrap";
	import axios from "axios";
	import {userName} from "../userStore"; 

	let currentUser;
	userName.subscribe(value => {
		currentUser = value;
	});

	let formData = {
		mobile: '',
		password: '',
	};

	const onLogin = (event) => {
		event.preventDefault();
        if(formData.mobile.length!= 11){
            alert("Phone number must be 11 characters long!");
        }
        else if(!(formData.password.length>=8 && formData.password.length<=32)){
            alert("Phone number must be at least 8 characters and at most 32 characters long!");
        }
        else{
            axios.post("/api/login", {
                mobile: formData.mobile,
                password: formData.password,
            }).then(res => {
                if (res.data.success) {
                    console.log(res);
                    userName.set(res.data.name);
                    window.location.href = '/';
                } else {
                    alert("No matching credentials found!");
                };
            }).catch(function (err) {
                console.log(err);
            });
        }
	};
</script>

<div id="loginform">
	<p class ='h1'>Sign In</p>
	<Form class="my-5 d-flex flex-column justify-content-center">
		<FormGroup floating label="Mobile Number">
			<Input type="tel" name="userid" id="userid" bind:value={formData.mobile} style="border-radius:0.7rem" />
		</FormGroup>
		<FormGroup floating label="Password">
			<Input type="password" name="password" id="password" bind:value={formData.password} style="border-radius:0.7rem" />
		</FormGroup>
		<Button class="w-50 p-3 mx-auto" color="success" on:click={onLogin} style="border-radius:0.7rem" 
			>Login</Button
		>
	</Form>
</div>

<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	@media only screen and (max-width: 768px) {
		#loginform {
			width: 90vw;
			margin: 5vw;
		}
	}

	@media only screen and (min-width: 768px) {
		#loginform {
			width: 30vw;
			margin: 5vw;
		}
	}
</style>
