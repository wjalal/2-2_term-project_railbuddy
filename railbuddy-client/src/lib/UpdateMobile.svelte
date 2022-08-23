<script>
	import { Styles, Form, FormGroup, Input, Button, Table } from "sveltestrap";
	import axios from "axios";

	import { userName } from "../userStore.js";

	let currentUser;
	userName.subscribe(value => {
		currentUser = value;
	});

	let formData = {
		newMobile: '', newMobile2: '',
		otp: '', password: '',
		showOTP: false,
		showNewMobile: false,
		showPassword: true,
		disableMobile: false,
	};

	const onUpdateMobile = (event) => {
		axios.defaults.withCredentials = true;
		event.preventDefault();
		if (!formData.showOTP && !formData.showNewMobile && formData.showPassword) {
			axios.post('/api/validateSendNewMobileOTP', {
				password: formData.password,
			}).then (res => {
				console.log(res);
				if (res.data.success === true) {
					formData.showNewMobile = true;
					formData.showPassword = false;
				} else {
					alert (`Your password has not matched.`); 
					userName.set(null);
					window.location.href = 'login';
				};
			}).catch (err => {
				console.log(err);
			});
		} else if (!formData.showOTP && formData.showNewMobile && !formData.showPassword) {
			if (formData.newMobile === formData.newMobile2) {
				// console.log(formData.password);
				axios.post("/api/sendNewMobileOTP", {
					newMobile: formData.newMobile,
					password: formData.password,
				}).then (res => {
					console.log(res);
					if (res.data.success === true) {
						formData.disableMobile = true;
						formData.showOTP = true;
					} else {
						userName.set(null);
						alert (`Failed to send OTP`); 
						window.location.href = 'login';
					};
				}).catch (err => {
					console.log(err);
				});
			} else alert ("Numbers don't match!");
		} else if (formData.showOTP && formData.showNewMobile && !formData.showPassword) {
			axios.post("/api/changePassword", {
				newMobile: formData.newMobile,
				password: formData.password,
				otp: formData.otp
			}).then (res => {
				console.log(res);
				if (res.data.success === false) {
					alert ("Password update failed.");
					userName.set(null);
					window.location.href = 'login';
				} else if (res.data.success === true) {
					alert ("Your password was successfully changed.");
					userName.set(null);
					window.location.href = 'login';
				};
			}).catch (err => {
				console.log(err);
			});
		};
	};
</script>

<div id="mobileupdateform">
	<h2>Change Mobile Number</h2>
	<Form class="my-5 d-flex flex-column justify-content-center">
		{#if formData.showPassword}
			<h4>Enter your password</h4>
			<FormGroup floating label="Password">
				<Input type="password" name="password" id="password" bind:value={formData.password} style="border-radius:0.7rem" />
			</FormGroup>
		{/if}
		{#if formData.showNewMobile}
			<FormGroup floating label="New mobile number">
				<Input type="tel" name="newMobile" id="newMobile" bind:value={formData.newMobile} disabled={formData.disableMobile} style="border-radius:0.7rem" />
			</FormGroup>
			<FormGroup floating label="Confirm new mobile number">
				<Input type="tel" name="newMobile2" id="newMobile2" bind:value={formData.newMobile2} disabled={formData.disableMobile} style="border-radius:0.7rem" />
			</FormGroup>
		{/if}
		{#if formData.showOTP}
			<FormGroup floating label="SMS Verification Code">
				<Input type="tel" name="otp" id="otp" bind:value={formData.otp} style="border-radius:0.7rem" />
			</FormGroup>
		{/if}
		<Button class='w-50 p-3 mx-auto' color='success' on:click={onUpdateMobile} style="border-radius:0.7rem" >Submit</Button>
	</Form>
</div>

<style>

@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	
	@media only screen and (max-width: 768px) {
		#mobileupdateform {
			padding: 5w;
			width: 90vw;
			margin: 5vw;
		}
		
	}

	@media only screen and (min-width: 768px) {
		#mobileupdateform {
			padding: 5w;
			width: 30vw;
			margin: 5vw;
		}
	}


</style>
