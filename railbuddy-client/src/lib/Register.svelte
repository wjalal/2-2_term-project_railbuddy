<script>
	import { Styles, Form, FormGroup, Input, Button, Table } from "sveltestrap";
	import axios from "axios";
	import { navigate } from 'svelte-navigator';

	let formData = {
		mobile: '', nid: '', dob: '',
		otp: '', password: '', password2: '',
		name: '', address: '',
		showOTP: false,
		showNID: false,
		showPassword: false,
		showKYC: false,
		disableNID: false,
		disableMobile: false
	};


	const onRegister = (event) => {
		event.preventDefault();
		if (!formData.showOTP && !formData.showNID && !formData.showPassword) {
			axios.post("/api/sendOTP", {
				mobile: formData.mobile,
			}).then (res => {
				console.log(res);
				if (res.data === true) {
					formData.showOTP = true;
					formData.disableMobile = true;
				} else alert (`The number ${formData.mobile} is already registered`); 
			}).catch (err => {
				console.log(err);
			});
		} else if (formData.showOTP && !formData.showNID && !formData.showPassword) {
			axios.post("/api/checkOTP", {
				mobile: formData.mobile,
				otp: formData.otp
			}).then (res => {
				console.log(res);
				if (res.data === true) {
					formData.showNID = true;
					formData.showOTP = false;
				} else alert (res.data); 
			}).catch (err => {
				console.log(err);
			});

		} else if (!formData.showOTP && formData.showNID && !formData.showPassword) {
			axios.post("/api/checkNID", {
				nid: formData.nid,
				dob: formData.dob
			}).then (res => {
				console.log(res);
				if (res.data === true) alert ("This NID is already registered with us!");
				else if (res.data === false) alert ("No matching NID data found");
				else {
					formData.name = res.data.name, formData.address = res.data.address;
					formData.disableNID = true;
					formData.showPassword = true;
					formData.showKYC = true;
				};
			}).catch (err => {
				console.log(err);
			});
		} else if (!formData.showOTP && formData.showNID && formData.showPassword) {
			if (formData.password === formData.password2) {
				console.log(formData.password);
				axios.post("/api/register", {
					nid: formData.nid,
					dob: formData.dob,
					mobile: formData.mobile,
					password: formData.password,
					name: formData.name,
					address: formData.address
				}).then (res => {
					console.log(res);
					if (res.data === false) alert ("Registration failed.");
					else if (res.data === true) {
						alert ("Your account was successfully registered.");
						window.location.href = 'login';
					}
				}).catch (err => {
					console.log(err);
				});
			} else alert ("Passwords don't match!");
		}
	};
</script>

<div id="loginform">
	<h1>Sign Up</h1>
	<Form class="my-5 d-flex flex-column justify-content-center">
		<FormGroup floating label="Mobile Number">
			<Input type="tel" name="userid" id="userid" bind:value={formData.mobile} disabled={formData.disableMobile}/>
		</FormGroup>
		{#if formData.showOTP}
			<FormGroup floating label="SMS Verification Code">
				<Input type="tel" name="userid" id="userid" bind:value={formData.otp} disabled={formData.disableNID}/>
			</FormGroup>
		{/if}
		{#if formData.showNID}
			<FormGroup floating label="NID">
				<Input type="tel" name="nid" id="nid" bind:value={formData.nid} disabled={formData.disableNID}/>
			</FormGroup>
			<FormGroup floating label="Date of Birth">
				<Input type="date" name="dob" id="dob" bind:value={formData.dob} disabled={formData.disableNID}/>
			</FormGroup>
		{/if}
		{#if formData.showKYC} 
			<Table>
				<tbody>
					<tr> 
						<th scope="row">Name</th>
						<td>{formData.name}</td>
					</tr>
					<tr> 
						<th scope="row">Address</th>
						<td>{formData.address}</td>
					</tr>
				</tbody>
			</Table>
		{/if}
		{#if formData.showPassword}
			<FormGroup floating label="Password">
				<Input type="password" name="password" id="password" bind:value={formData.password}/>
			</FormGroup>
			<FormGroup floating label="Confirm Password">
				<Input type="password" name="password2" id="password2" bind:value={formData.password2}/>
			</FormGroup>
		{/if}
		<Button class='w-50 p-3 mx-auto' color='success' on:click={onRegister}>Submit</Button>
	</Form>
</div>

<style>
	
	@media only screen and (max-width: 768px) {
		#loginform {
			padding: 5w;
			width: 90vw;
			margin: 5vw;
		}
		
	}

	@media only screen and (min-width: 768px) {
		#loginform {
			padding: 5w;
			width: 30vw;
			margin: 5vw;
		}
	}


</style>
