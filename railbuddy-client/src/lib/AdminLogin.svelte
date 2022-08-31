<script>
	import { Styles, Form, FormGroup, Input, Button, Label } from "sveltestrap";
	import axios from "axios";
	import {adminName} from "../userStore"; 

	let currentAdmin;
    adminName.subscribe(value => {
		currentAdmin = value;
	});

	let formData = {
		id: '',
		password: '',
	};

	const onLogin = (event) => {
		event.preventDefault();
		axios.post("/api/adminLogin", {
			id: formData.id,
			password: formData.password,
		}).then(res => {
            console.log(res.data);
			if (res.data.success && res.data.admin) {
				console.log(res);
				adminName.set(res.data.name);
				window.location.href = '/';
			} else {
				alert("No matching credentials found!");
			};
		}).catch(function (err) {
			console.log(err);
		});
	};
</script>

<div id="loginform">
	<p class ='h1'>Admin Login</p>
	<Form class="my-5 d-flex flex-column justify-content-center">
		<FormGroup floating label="Admin ID">
			<Input type="tel" name="id" id="id" bind:value={formData.id} style="border-radius:0.7rem" />
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
