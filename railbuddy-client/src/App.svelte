<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Rubik">
<script>
	import { 	Styles, Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, Dropdown, 
				DropdownToggle, DropdownMenu, DropdownItem, Button, Icon, Spinner } from "sveltestrap";
	import { onMount } from "svelte";
	import { Router, Route, Link } from "svelte-navigator";
	import Search from "./lib/Search.svelte";
	import Login from "./lib/Login.svelte";
	import Register from "./lib/Register.svelte";
	import Profile from "./lib/Profile.svelte"; 
	import Purchases from "./lib/Purchases.svelte"; 
	import PayMessage from "./lib/PayMessage.svelte"; 
	import Password from "./lib/Password.svelte";
	import UpdateMobile from "./lib/UpdateMobile.svelte";
	import AdminLogin from "./lib/AdminLogin.svelte";
	import Admin from "./lib/Admin.svelte";
	import TicketVerif from "./lib/TicketVerif.svelte";
	import Complaints from "./lib/Complaints.svelte";
	import Requests from "./lib/Requests.svelte";
	import Notices from "./lib/Notices.svelte";
	import ComplaintAdmin from "./lib/ui/ComplaintAdmin.svelte";
	import RequestAdmin from "./lib/ui/RequestAdmin.svelte";
	import NoticeAdmin from "./lib/ui/NoticeAdmin.svelte";
	import ScheduleUpdate from "./lib/ui/ScheduleUpdate.svelte";
	import ReclaimNIDAdmin from "./lib/ui/ReclaimNIDAdmin.svelte";
	import ForeignRegAdmin from "./lib/ui/ForeignRegAdmin.svelte";
	import UserInfoCorrectAdmin from "./lib/ui/UserInfoCorrectAdmin.svelte";
	import railbuddyLogo from "./assets/railBuddy.png";
	import axios from 'axios';
	import { userName, adminName, loading } from "./userStore.js";

	const server = '';
	
	onMount (event => {
		axios.defaults.withCredentials = true;
		axios.post(`${server}/api/getSession`).then(res => {
			console.log(res.data);
			if (res.data.success === true) {
				console.log(res.data);
				if (res.data.admin === true) adminName.set(res.data.name), userName.set(null);
				else userName.set(res.data.name), adminName.set(null);
			} else {
				userName.set(null);
				adminName.set(null);
				//window.location.reload();
			};
		}).catch(function (err) {
			console.log(err);
		});
	});

	let currentUser, showSpinner, currentAdmin;
	userName.subscribe(value => {
		currentUser = value;
	});
	loading.subscribe(value => {
		showSpinner = value;
	});
	adminName.subscribe(value => {
		currentAdmin = value;
	});
		
	let isOpen = false;

	const onLogout = (event) => {
		event.preventDefault();
		axios.defaults.withCredentials = true;
		axios.post("/api/logout", {
			logout: true
		}).then(res => {
			userName.set(null);
			if (res.data.success) window.location.href = '/';
			else alert("Failed to log out!");
		}).catch(function (err) {
			console.log(err);
			userName.set(null);
			alert("Failed to log out!");
		});
	};

	const handleUpdate = (event) => {
		isOpen = event.detail.isOpen;
	};

</script>

<Router primary={false}>
	<header>
		<Navbar id="rbnavbar" class='{!showSpinner?"fixed-top":""} px-2 border-bottom border-2 border-success shadow' 
				style='background-color: rgb(225, 251, 220)' light expand="md">
			<NavbarBrand href="/">
				<div style="display:flex; align-items:center; gap:2vw">
					<img id="railbuddy-logo" src={railbuddyLogo} alt="RailBuddy logo">
					<b class='h6 mt-2' id="nav-title">
						{#if currentAdmin === null}	Smart e-Ticketing Platform
						{:else}	RailBuddy Admin Panel {/if}
					</b>
				</div>	
			</NavbarBrand>
			<NavbarToggler on:click={() => (isOpen = !isOpen)} />
			<Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
				<Nav class="ms-auto" navbar>
				{#if currentAdmin === null}
					<NavItem class='mx-lg-2'>
						<NavLink href="/">  Search / Buy</NavLink>
					</NavItem>
					{#if currentUser === null}
						<NavItem class='mx-lg-2'>
							<NavLink href="login">Login</NavLink>
						</NavItem>
						<NavItem class='mx-lg-2'>
							<NavLink href="register">Register</NavLink>
						</NavItem>
					{/if}
					<NavItem class='mx-lg-2'>
						<NavLink href="verif">Ticket Verification</NavLink>
					</NavItem>
					<Dropdown nav inNavbar>
						<DropdownToggle nav caret>Reach Out to Us </DropdownToggle>
						<DropdownMenu style='background-color: rgb(225, 251, 220)' end>
						<DropdownItem>
							<Link class='text-dark' to= "complaint">Complaint</Link>
						</DropdownItem>
						<DropdownItem>
							<Link class='text-dark' to= "request">Request</Link>
						</DropdownItem>
						<DropdownItem>
							<Link class='text-dark' to= "notice">Notices</Link>
						</DropdownItem>
						<DropdownItem divider />
						<DropdownItem>
							<Link class='text-dark' to= "contact">Contact Us</Link>
						</DropdownItem>
						</DropdownMenu>
					</Dropdown>
					{#if currentUser !== null}
						<Dropdown class="mx-md-4 mt-4 mt-md-0" nav inNavbar>
							<DropdownToggle nav caret>
								<Icon name="person-circle" />
								<b>{`${currentUser}`}</b> 
							</DropdownToggle>
							<DropdownMenu style='background-color: rgb(225, 251, 220)' end>
							<DropdownItem>
								<Link class='text-dark' to= "profile">My Profile / Preferences</Link>
							</DropdownItem>
							<DropdownItem>
								<Link class='text-dark' to= "purchases">Purchase History</Link>
							</DropdownItem>
							<DropdownItem divider />
							<DropdownItem>
								<Button class="w-100 border-danger" color="light" on:click={onLogout}>Log out</Button>
							</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					{/if}
				{:else}
					<NavItem class='mx-lg-2'>
						<NavLink href="admin_schedule"> Update Schedule</NavLink>
					</NavItem>
					<NavItem class='mx-lg-2'>
						<NavLink href="admin_complaint">  Complaints</NavLink>
					</NavItem>
					<NavItem class='mx-lg-2'>
						<NavLink href="admin_request">  Requests</NavLink>
					</NavItem>
					<!-- <NavItem class='mx-lg-2'>
						<NavLink href="admin_edit_train">  Modify Train Data</NavLink>
					</NavItem> -->
					<NavItem class='mx-lg-2'>
						<NavLink href="admin_edit_notice">  Post Notices</NavLink>
					</NavItem>
					<Dropdown class="mx-md-4 mt-4 mt-md-0" nav inNavbar>
						<DropdownToggle nav caret>
							Customer Service
						</DropdownToggle>
						<DropdownMenu style='background-color: rgb(225, 251, 220)' end>
							<DropdownItem>
								<Link class='text-dark' to= "admin_reclaim">Reclaim NID</Link>
							</DropdownItem>
							<DropdownItem>
								<Link class='text-dark' to= "admin_foreigner">Foreign User Registration</Link>
							</DropdownItem>
							<DropdownItem>
								<Link class='text-dark' to= "admin_correction">User Info Correction</Link>
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
					<Dropdown class="mx-md-4 mt-4 mt-md-0" nav inNavbar>
						<DropdownToggle nav caret>
							<Icon name="person-circle" />
							<b>{`${currentAdmin}`}</b> 
						</DropdownToggle>
						<DropdownMenu style='background-color: rgb(225, 251, 220)' end>
						<DropdownItem>
							<Button class="w-100 border-danger" color="light" on:click={onLogout}>Log out</Button>
						</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				{/if}
				</Nav>

			</Collapse>
		</Navbar>
	</header>

	<main>
		<br><br><br><br>
		<Route path="/">			<Search/>					</Route>
		<Route path="search">		<Search/>					</Route>
		<Route path="login">		<Login/>					</Route>
		<Route path="register">		<Register/>					</Route>
		<Route path="profile">		<Profile/>					</Route>
		<Route path="password">		<Password/>					</Route>
		<Route path="update-mobile"><UpdateMobile/>				</Route>
		<Route path="purchases">	<Purchases/>				</Route>
		<Route path="admin_login">	<AdminLogin/>				</Route>
		<Route path="admin">		<Admin/>					</Route>
		<Route path="pay_success">	<PayMessage mode='success'/></Route>
		<Route path="pay_fail">		<PayMessage mode='fail'/>	</Route>
		<Route path="pay_cancel">	<PayMessage mode='cancel'/>	</Route>
		<Route path="verif">		<TicketVerif/>				</Route>
		<Route path="complaint">	<Complaints/>				</Route>
		<Route path="request">		<Requests/>					</Route>
		<Route path="notice">		<Notices/>					</Route>

		
		<Route path="admin_reclaim">		<ReclaimNIDAdmin server = {""}/>					</Route>
		<Route path="admin_foreigner">		<ForeignRegAdmin server = {""}/>					</Route>
		<Route path="admin_correction">		<UserInfoCorrectAdmin server = {""}/>			</Route>
		<Route path="admin_schedule">		<ScheduleUpdate server = {""}/>					</Route>
		<Route path="admin_complaint">		<ComplaintAdmin server = {""}/>					</Route>
		<Route path="admin_request">		<RequestAdmin server = {""}/>					</Route>
		<Route path="admin_edit_train">		<Requests/>					</Route>
		<Route path="admin_edit_notice">	<NoticeAdmin server = {""}/>					</Route>
	</main>
</Router>


<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	@media only screen and (max-width: 1080px) {
		#railbuddy-logo {
			width: 20vw;	
		}		
	}

	@media only screen and (max-width: 768px) {
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
		#railbuddy-logo {
			width: 15vh;	
		}	
	}
	
	:global(body){ 
		background-color: rgb(250, 255, 240);
		font-family: "Rubik", sans-serif;
	}

</style>
