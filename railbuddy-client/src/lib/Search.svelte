<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
	import { onMount } from "svelte";
	import { Styles, Form, FormGroup, Input, Button, Icon } from "sveltestrap";
	import axios from "axios";

	let formData = {
		from: 0,
		to: 0,
		date: '',
		class: ''
	};

	let stations = [], classes = [];

	const server = "http://localhost";

	onMount (event => {
		axios.defaults.withCredentials = true;
		axios.post(`${server}/api/getStations`).then(res => {
			stations = [{name: ""}, ...res.data];
		}).catch(function (err) {
			console.log(err);
		});
		axios.post(`${server}/api/getClasses`).then(res => {
			classes = res.data;
		}).catch(function (err) {
			console.log(err);
		});
	});

	const onLogin = (event) => {
		event.preventDefault();
		axios.post("/api/login", {
			mobile: formData.mobile,
			password: formData.password,
		}).then(res => {
			if (res.data.success) {
				console.log(res);
				localStorage.setItem('railbuddyUserName', res.data.name);
				window.location.href = '/';
			} else {
				alert("No matching credentials found!");
			};
		}).catch(function (err) {
			console.log(err);
		});
	};
</script>

<div id="searchform">
	<h2>Search and Buy Tickets</h2>
	<Form class="my-5 d-flex flex-column justify-content-center">
		<FormGroup floating label="Start from (Starting station)">
			<Input type="select" name="from" id="from" bind:value={formData.from}>
				{#each stations as st8n} 
					<option value={st8n.id}> 
						{st8n.name + (st8n.name !== "" ? `  (${st8n.district})` : "")}
					</option>
				{/each}
			</Input>
		</FormGroup>
		<FormGroup floating label="Travel to (Destination station)">
			<Input type="select" name="to" id="to" bind:value={formData.to}>
				{#each stations as st8n} 
				<option value={st8n.id}> 
					{st8n.name + (st8n.name !== "" ? `  (${st8n.district})` : "")}
				</option>
				{/each}
			</Input>
		</FormGroup>
		<FormGroup floating label="Date of Travel">
			<Input type="date" name="date" id="date" bind:value={formData.date}/>
		</FormGroup>
		<FormGroup floating label="Class">
			<Input type="select" name="class" id="class" bind:value={formData.class}>
				{#each classes as cls} 
					<option>{cls}</option>
				{/each}
			</Input>
		</FormGroup>
		<Button class="w-50 p-2 mx-auto" color="success" on:click={onLogin}>
			Search &nbsp; <Icon name="search" />
		</Button>
	</Form>
</div>

<style>
	
	@media only screen and (max-width: 768px) {
		#searchform {
			width: 90vw;
			margin: 5vw;
		}
	}

	@media only screen and (min-width: 768px) {
		#searchform {
			width: 30vw;
			margin: 5vw;
		}
	}
</style>
