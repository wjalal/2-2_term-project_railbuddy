<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>

<script>
	import { Styles, Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, Dropdown, DropdownToggle, DropdownMenu,DropdownItem, Button, Icon } from "sveltestrap";
	import { Router, Route, Link } from "svelte-navigator";
	import Search from "./lib/Search.svelte";
	import Login from "./lib/Login.svelte";
	import Register from "./lib/Register.svelte";
	import Profile from "./lib/Profile.svelte"; 
	import Password from "./lib/Password.svelte";
	import railbuddyLogo from "./assets/railBuddy.png";
	import axios from 'axios';

	let isOpen = false;
	$: userName = localStorage.getItem('railbuddyUserName');

	const onLogout = (event) => {
		event.preventDefault();
		axios.defaults.withCredentials = true;
		axios.post("/api/logout", {
			logout: true
		}).then(res => {
			localStorage.removeItem('railbuddyUserName');
			if (res.data.success) window.location.href = '/';
			else alert("Failed to log out!");
		}).catch(function (err) {
			console.log(err);
			localStorage.removeItem('railbuddyUserName');
			alert("Failed to log out!");
		});
	};

	const handleUpdate = (event) => {
		isOpen = event.detail.isOpen;
	};

</script>

<Router>
	<header>
		<Navbar class="px-2 px-md-5 mx-md-5 border-bottom border-2 border-success" color="light" light expand="md">
			<NavbarBrand href="/">
				<div style="display:flex; align-items:center; gap:2vw">
					<img id="railbuddy-logo" src={railbuddyLogo} alt="RailBuddy logo">
					<h6>Smart e-Ticketing Platform</h6>
				</div>	
			</NavbarBrand>
			<NavbarToggler on:click={() => (isOpen = !isOpen)} />
			<Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
				<Nav class="ms-auto" navbar>
				<NavItem>
					<NavLink href="/">  Search / Buy</NavLink>
				</NavItem>
				{#if userName === null}
					<NavItem>
						<NavLink href="login">Login</NavLink>
					</NavItem>
					<NavItem>
						<NavLink href="register">Register</NavLink>
					</NavItem>
				{/if}
				<NavItem>
					<NavLink href="verif">Ticket Verification</NavLink>
				</NavItem>
				<Dropdown nav inNavbar>
					<DropdownToggle nav caret>Reach Out to Us </DropdownToggle>
					<DropdownMenu end>
					<DropdownItem>
						<Link to= "complaint">Complaint</Link>
					</DropdownItem>
					<DropdownItem>
						<Link to= "request">Request</Link>
					</DropdownItem>
					<DropdownItem divider />
					<DropdownItem>
						<Link to= "contact">Contact Us</Link>
					</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				{#if userName !== null}
					<Dropdown class="mx-md-4 mt-4 mt-md-0" nav inNavbar>
						<DropdownToggle nav caret>
							<Icon name="person-circle" />
							<b>{`${userName}`}</b> 
						</DropdownToggle>
						<DropdownMenu end>
						<DropdownItem>
							<Link to= "profile">My Profile / Preferences</Link>
						</DropdownItem>
						<DropdownItem>
							<Link to= "purchases">Purchase History</Link>
						</DropdownItem>
						<DropdownItem divider />
						<DropdownItem>
							<Button class="w-100" color="light" on:click={onLogout}>Log out</Button>
						</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				{/if}
				</Nav>

			</Collapse>
		</Navbar>
	</header>

	<main>
		<Route path="/">
			{window.location.replace("search")}
		</Route>
		<Route path="search">
			<Search/>
		</Route>
		<Route path="login">
			<Login/>
		</Route>
		<Route path="register">
			<Register/>
		</Route>
		<Route path="profile">
			<Profile/>
		</Route>
		<Route path="password">
			<Password/>
		</Route>
	</main>
</Router>


<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	@media only screen and (max-width: 1080px) {
		#railbuddy-logo {
			width: 20vw;	
		}		
	}

	@media only screen and (min-width: 1080px) {
		#railbuddy-logo {
			width: 15vh;	
		}	
	}

</style>
