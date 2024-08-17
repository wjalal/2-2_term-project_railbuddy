<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
	import { onMount } from "svelte";
	import { Styles, Form, FormGroup, Input, Button, Label, Table, Icon } from "sveltestrap";
	import axios from "axios";
	import ProfileEditButton from "./ui/ProfileEditButton.svelte";

	let userData = { };

	let showEdit = {
		address: false,
		locale: false,
		pay_method: false,
		pay_acc: false
	};

	let formData = { };

	onMount (event => {
		//event.preventDefault();
		axios.defaults.withCredentials = true;
		axios.post("/api/getProfile").then(res => {
			//console.log(res.data);
			userData = { ...res.data };
			formData = { 
				address: userData.address,
				locale: userData.locale,
				pay_method: userData.pay_method,
				pay_acc: userData.pay_acc
			};
		}).catch(function (err) {
			console.log(err);
		});
	});

	const printDate = date => {
		let str = (new Date(date)).toDateString();
		return (str.substring(4, str.length));
	};

	const showUpdateInput = (event, attr) => {
		event.preventDefault();
		if (attr==='address' || attr==='locale' || attr==='pay_method' || attr==='pay_acc') showEdit[attr] = !showEdit[attr];
		else if (attr==='mobile') window.location.href = "/update-mobile";
	};

	const updateUserAttr = (event, attr) => {	
		event.preventDefault();
		if (attr==='address' || attr==='locale' || attr==='pay_method' || attr==='pay_acc') {
			axios.post("/api/updateUser", {
				attr: attr,
				value: formData[attr],
				mobile: userData.mobile
			}).then(res => {
				//console.log(res.data);
				if (res.data.success === true) window.location.reload(), console.log('updated!');
				else alert("Refused by server.")
			}).catch(function (err) {
				console.log(err);
			});
		} else {
            alert("Invalid Input, Please check your entries again.")
        }
	};

</script>

<div id="profile">
	{#if userData.success === true}
		<h2 class="m-1">{userData.name}</h2>
		<Form class="my-5 d-flex flex-column justify-content-center">
			<Table>
				<tbody>
					<tr> 
						<th scope="row"><Icon name="phone"/>&nbsp;&nbsp;Mobile No.</th>
						<td>{userData.mobile}</td>
						<td><ProfileEditButton attr="mobile" showUpdateInput={showUpdateInput}/></td>
					</tr>
					<tr> 
						<th scope="row"><Icon name="card-list"/>&nbsp;&nbsp;NID</th>
						<td>{userData.nid}</td><td></td>
					</tr>
					<tr> 
						<th scope="row"><Icon name="calendar-date"/>&nbsp;&nbsp;Date of Birth</th>
						<td>{printDate(userData.dob)}</td><td></td>
					</tr>
					<tr> 
						<th scope="row"><Icon name="house-door"/>&nbsp;&nbsp;Address</th>
						<td>{userData.address}</td>
						<td><ProfileEditButton attr="address" showUpdateInput={showUpdateInput}/></td>
					</tr>
					{#if showEdit.address}
						<tr>
							<td colspan="3">
								<FormGroup class="d-flex flex-row" floating label="Address">
									<Input class="mx-2" type="text" name="address" id="address" bind:value={formData.address}/>
									<Button color="primary" on:click={(event) => updateUserAttr(event, "address")}>Update</Button> 
								</FormGroup>
							</td>
						</tr>
					{/if}
					<tr> 
						<td colspan="3"><br><br>
							<small class="text-muted">
								<Icon class="my-2" name="gear"/>
								User preferences
							</small>
						<br><br></td>
					</tr>
					<tr> 
						<th scope="row"><Icon name="globe2"/>&nbsp;&nbsp;Language</th>
						<td>{userData.locale}</td>
						<td><ProfileEditButton attr="locale" showUpdateInput={showUpdateInput}/></td>
					</tr>
					{#if showEdit.locale}
						<tr>
							<td colspan="3">
								<FormGroup class="d-flex flex-row" floating label="Language">
									<Input class="mx-2" type="select" name="locale" id="locale" bind:value={formData.locale}>
										<option>English</option>
										<option>বাংলা</option>
										<option>অসমীয়া</option>
									</Input>
									<Button color="primary" on:click={(event) => updateUserAttr(event, "locale")}>Update</Button> 
								</FormGroup>
							</td>
						</tr>
					{/if}
					<tr> 
						<th scope="row"><Icon name="cash-stack"/>&nbsp;&nbsp;Default Payment Method</th>
						<td>{userData.pay_method}</td>
						<td><ProfileEditButton attr="pay_method" showUpdateInput={showUpdateInput}/></td>
					</tr>
					{#if showEdit.pay_method}
						<tr>
							<td colspan="3">
								<FormGroup class="d-flex flex-row" floating label="Default Payment Method">
									<Input class="mx-2" type="select" name="pay_method" id="pay_method" bind:value={formData.pay_method}>
										<option>bKash</option><option>Rocket</option><option>Nagad</option><option>u-Pay</option>
										<option>MasterCard</option><option>VISA</option><option>American Express</option><option>Bank</option>
									</Input>
									<Button color="primary" on:click={(event) => updateUserAttr(event, "pay_method")}>Update</Button> 
								</FormGroup>
							</td>
						</tr>
					{/if}
					<tr> 
						<th scope="row"><Icon name="credit-card"/>&nbsp;&nbsp;Payment Account</th>
						<td>{userData.pay_acc}</td>
						<td><ProfileEditButton attr="pay_acc" showUpdateInput={showUpdateInput}/></td>
					</tr>
					{#if showEdit.pay_acc}
						<tr>
							<td colspan="3">
								<FormGroup class="d-flex flex-row" floating label="Payment Account">
									<Input class="mx-2" type="text" name="pay_acc" id="pay_acc" bind:value={formData.pay_acc}/>
									<Button color="primary" on:click={(event) => updateUserAttr(event, "pay_acc")}>Update</Button> 
								</FormGroup>
							</td>
						</tr>
					{/if}
				</tbody>
			</Table>
			<Button class='w-50 p-2 mx-auto my-2' outline color='danger' href='/password'>Change Password</Button>
		</Form>
	{:else}
		<h2>No user logged in!</h2>
	{/if} 
</div>

<style>

	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	@media only screen and (max-width: 768px) {
		#profile {
			width: 90vw;
			margin: 5vw;
		}
	}

	@media only screen and (min-width: 768px) {
		#profile {
			width: 45vw;
			margin: 5vw;
		}
	}
</style>
