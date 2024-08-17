<script>
	import { Card, CardActions, Button, MaterialApp, CardText, TextField, Icon } from "svelte-materialify";
	import { mdiAccount, mdiLock, mdiEyeOff, mdiEye, mdiLogin } from '@mdi/js';
	import sitelogo from "../assets/genericlogo.png";
	import axios from "axios";
	import {userName, contactList} from "../userStore"; 

	let currentUser;
	userName.subscribe(value => {
		currentUser = value;
	});
	
	let showPw = false

	let formData = {
		userid: '',
		password: '',
	};

	const onLogin = (event) => {
		event.preventDefault();

        if(!(formData.password.length>=8 && formData.password.length<=32)){
            alert("Phone number must be at least 8 characters and at most 32 characters long!");
        }
        else{
            axios.post("/api/login", {
                userid: formData.userid,
                password: formData.password,
            }).then(res => {
                if (res.data.success) {
                    console.log(res);
                    userName.set(res.data.name);

					axios.post("/api/getContactList").then(res2 => {
						if (res2.data.success === false) {
							alert("falied to get contact data");
							window.location.reload();
						} else {
							contactList.set(res2.data)
						};
					}).catch(function (err) {
						console.log(err);
					});

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
<br>
<div id="loginform">
	<Card class="pa-4 rounded-xl ">
		<div class=" d-flex flex-column">
		<!-- <FormGroup floating label="User ID">
			<Input type="tel" name="userid" id="userid" bind:value={formData.userid} style="border-radius:0.7rem" />
		</FormGroup> -->
		<img src={sitelogo} class="mb-3 mt-2 align-self-center" alt="logo" style="width:60%"/>
		<p class ='text-h4 mb-4 mt-2 align-self-center'>Sign In</p>
		<TextField class="rounded-lg mb-1 mt-4" color="blue darken-3" outlined bind:value={formData.userid}>
			<div slot="prepend"> <Icon path={mdiAccount}/> </div> User ID
		</TextField>
		<!-- <FormGroup floating label="Password">
			<Input type="password" name="password" id="password" bind:value={formData.password} style="border-radius:0.7rem" />
		</FormGroup> -->
		<TextField class="rounded-lg mb-1" color="blue darken-3" outlined type={showPw?'text':'password'} bind:value={formData.password}>
			<div slot="prepend"> <Icon path={mdiLock}/> </div> Password
			<div
			slot="append"
			on:click={() => {
			  showPw = !showPw;
			}}>
			<Icon path={showPw ? mdiEyeOff : mdiEye} />
		  </div>
		</TextField>
		<Button class="pa-4 mt-3 blue darken-3 grey-text text-lighten-5 rounded-xl align-self-center" 
				on:click={onLogin}> <Icon path={mdiLogin} class="mr-3"/>  Login </Button>
		</div>
	</Card>
</div>

<style>

	@media only screen and (max-width: 768px) {
		#loginform {
			width: 90vw;
			margin: 5vw;
		}
	}

	@media only screen and (min-width: 768px) {
		#loginform {
			width: 20vw;
			margin: 5vw;
		}
	}

</style>
