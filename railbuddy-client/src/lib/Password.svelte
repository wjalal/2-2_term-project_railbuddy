<script>
	import { Styles, Form, FormGroup, Input, Button, Label } from "sveltestrap";
	import axios from "axios";

	let password0 = '', password = '', password2 = '';

	const onLogin = (event) => {
		event.preventDefault();
		if (password === password2) {
			axios.defaults.withCredentials = true;
			axios.post("/api/updatePassword", {
				password0: password0,
				password: password
			}).then(res => {
				if (res.data.success === true) {
					console.log(res);
					alert("Password change successful! Please log in with new password.")
					localStorage.removeItem('railbuddyUserName');
					window.location.href = '/login';
				} else {
					alert("Failed to update. Old password might not have matched.");
				};
			}).catch(function (err) {
				console.log(err);
			});
		} else alert("New passwords don't match!");
	};
</script>

<div id="passform">
	<h1>Change Password</h1>
	<Form class="my-5 d-flex flex-column justify-content-center">
		<FormGroup floating label="Old Password">
			<Input type="password" name="password0" id="password0" bind:value={password0}/>
		</FormGroup><br>
		<FormGroup floating label="New Password">
			<Input type="password" name="password" id="password" bind:value={password}/>
		</FormGroup>
		<FormGroup floating label="Confirm New Password">
			<Input type="password" name="password2" id="password2" bind:value={password2}/>
		</FormGroup><br>
		<Button class="w-50 p-2 mx-auto" color='danger' on:click={onLogin}>Submit</Button>
	</Form>
</div>

<style>
	
	@media only screen and (max-width: 768px) {
		#passform {
			width: 90vw;
			margin: 5vw;
		}
	}

	@media only screen and (min-width: 768px) {
		#passform {
			width: 30vw;
			margin: 5vw;
		}
	}
</style>
