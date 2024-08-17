<script>
	import { 	Card, CardActions, Button, MaterialApp, CardText, NavigationDrawer, List, ListItem, Icon } from "svelte-materialify";
	import { onMount } from "svelte";
	import { Router, Route, Link } from "svelte-navigator";
	import Login from "./lib/Login.svelte";
	import { mdiHome, mdiViewDashboard, mdiAccountBox, mdiAccount, mdiGroup, mdiFile, mdiAccountGroup, mdiContacts, mdiAccountPlus, mdiHamburger, mdiMenu } from '@mdi/js';
	import axios from 'axios';
	import { userName, userType, loading } from "./userStore.js";
    import Dashboard from "./lib/Dashboard.svelte";
    import AdminDashboard from "./lib/AdminDashboard.svelte";
    import UserList from "./lib/UserList.svelte";
    import AddContact from "./lib/AddContact.svelte";
    import Messages from "./lib/Messages.svelte";
    import NavBar from "./lib/NavBar.svelte";

	const server = 'http://localhost:6969';
	
	let currentUser, currentUserType, showSpinner, userContacts = [];
	let mNavBarShow = false;
	userName.subscribe(value => {
		currentUser = value;
	});
	userType.subscribe(value => {
		currentUserType = value;
	});
	loading.subscribe(value => {
		showSpinner = value;
	});


	let isOpen = false;

	let getContacts = () => {
		axios.post("/api/getContactList").then(res2 => {
			if (res2.data.success === false) {
				alert("falied to get contact data");
				window.location.reload();
			} else {
				userContacts = [...res2.data];
				console.log(userContacts);
			};
		}).catch(function (err) {
			console.log(err);
		});
	};

	onMount (event => {
		axios.defaults.withCredentials = true;
		axios.post(`/api/getSession`).then(res => {
			console.log(res.data);
			if (res.data.success === true) {
				userName.set(res.data.userid), userType.set(res.data.type);
				getContacts();
			} else {
				userName.set(null), userType.set(null);;
				//window.location.reload();
			};
		}).catch(function (err) {
			console.log(err);
		});

		setInterval (() => {
			if (currentUser) getContacts();
		}, 4000)
	});

	const onLogout = (event) => {
		event.preventDefault();
		axios.defaults.withCredentials = true;
		axios.post("/api/logout", {
			logout: true
		}).then(res => {
			userName.set(null), userType.set(null);
			if (res.data.success) window.location.href = '/';
			else alert("Failed to log out!");
		}).catch(function (err) {
			console.log(err);
			userName.set(null), userType.set(null);
			alert("Failed to log out!");
		});
	};

	const handleUpdate = (event) => {
		isOpen = event.detail.isOpen;
	};

</script>

<MaterialApp>
<Router primary={false}>
<main>
	<div style="height:100vh; width:100vw; position:fixed" class="light-blue lighten-5"/>
	{#if currentUser != null}
	<div id="navbar">
		<NavBar userContacts={userContacts} currentUser={currentUser} onLogout={onLogout} />
	</div>
	<div id="mbutton" style="position:fixed; z-index:200; left:1.5%; top:1.5%">
		<Button class="blue darken-4 grey-text text-lighten-5" fab icon rounded size="x-large"
				on:click={() => {mNavBarShow = !mNavBarShow}}>
			<Icon path={mdiMenu}/></Button>
	</div>
	{#if mNavBarShow}
	<div id="mnavbar" >
		<NavBar userContacts={userContacts} currentUser={currentUser} onLogout={onLogout} />
	</div>{/if}
	{/if}
	<div>
		<Route path="/">			
			{#if currentUser == null} <Login/>
			{:else} 
				{#if currentUserType=='client'} <Dashboard/>
				{:else} <AdminDashboard/>
=				{/if}
			{/if}
		</Route>
		<Route path="login">			<Login/>					</Route>
		<Route path="dashboard">		<Dashboard/>				</Route>
		<Route path="admin-dashboard">	<AdminDashboard/>			</Route>
		<Route path="user-list">		<UserList/>					</Route>
		<Route path="add-contact">		<AddContact/>				</Route>
		<Route path="messages">			<Messages />				</Route>
	</div>
</main>
</Router>
</MaterialApp>

<style>
	/* @import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"; */

	@media only screen and (max-width: 768px) {
		#navbar {
			visibility: hidden;	
		}		

		#mbutton {
			visibility: visible;	
		}		
	}


	@media only screen and (min-width: 768px) {
		#navbar {
			visibility: visible;	
		}		
		#mbutton {
			visibility: hidden;	
		}	
	}

	/* @media only screen and (max-width: 768px) {
		#nav-title {
			visibility: visible;	
		}
	}

	@media only screen and (min-width: 768px) {
		#nav-title {
			visibility: hidden;	
		}

		:global(#rbnavbar) {
			padding-left: 4.5rem !important;
			padding-right: 4.5rem !important;
		}
	}

	@media only screen and (min-width: 1220px) {
		#nav-title {
			visibility: visible;	
		}

		:global(#rbnavbar) {
			padding-left: 6.5rem !important;
			padding-right: 6.5rem !important;
		}
	}
	
	@media only screen and (min-width: 1080px) {
		#site-logo {
			width: 15vh;	
		}	
	}  */
	/* :global(body){ 
		background-color: rgb(250, 255, 240);
		font-family: "Rubik", sans-serif;
	} */

</style>
