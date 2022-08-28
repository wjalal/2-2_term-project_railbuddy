<script>
	import { Styles, Form, FormGroup, Input, Button, Label, Table } from "sveltestrap";
	import axios from "axios";
	import { onMount } from "svelte";
	import { userName } from "../userStore.js";

	let formData = {
		station: null,
		train: null,
        text: '',
		category: ''
	};

	let complaints = [], sComp = null, stations = [], trains = [], compTypes = [], currentUser;

	userName.subscribe(value => {
		currentUser = value;
	});

	const printDate = date => {
		let str = (new Date(date)).toDateString();
		return (str.substring(4, str.length));
	};

	const server = '';

	const refreshHistory = () => {
		axios.defaults.withCredentials = true;
		axios.post(`${server}/api/getCompTypes`).then(res1 => {
			compTypes = res1.data;
			formData.category = 'Others'
			axios.post(`${server}/api/getStations`).then(res2 => {
				stations = [ {id: null, name:''}, ...res2.data];
				axios.post(`${server}/api/getTrains`).then(res3 => {
					trains = [  {id: null, name:''}, ...res3.data];
					axios.post(`${server}/api/getComplaints`).then(res4 => {
						complaints = [...res4.data.complaints];
					}).catch(err => { console.log(err) });
				}).catch(err => { console.log(err) });
			}).catch(err => { console.log(err) });
		}).catch(err => { console.log(err) });
	};

	onMount (event => {
		refreshHistory();
	});

	const onComplain = (event) => {
		event.preventDefault();
		axios.post("/api/makeComplaint", {
			station: formData.station,
			train: formData.train,
			text: formData.text,
			category: formData.category
		}).then(res => {
			console.log(res);
			if (res.data.success) {
				formData.station = null, formData.train = null, formData.text = '', formData.category = ''; 
				refreshHistory();
			} else {
				alert("Complaint Submission Failed!");
			};
		}).catch(err => { console.log(err) });
	};

</script>

{#if currentUser}
	<div class='d-flex flex-column justify-content-center align-items-center'>
		<div class='d-flex flex-md-row flex-column justify-content-center align-items-start'>
			<div class='pt-3 d-flex flex-column comp'>
				<p class ='h2'>New Complaint</p>
				<Form class="my-2 my-md-3 d-flex flex-column justify-content-center">
					<FormGroup class="mx-1" floating label="Category">
						<Input 	type="select" name="category" id="category" bind:value={formData.category}
								style='height: calc(3.5rem + 2px); border-radius: 0.7rem'>
							{#each compTypes as c} 
								<option value={c}>{c}</option>
							{/each}
						</Input>
					</FormGroup>
					<FormGroup class="mx-1" floating label="Associated Station (if any)">
						<Input 	type="select" name="station" id="station" bind:value={formData.station}
								style='height: calc(3.5rem + 2px); border-radius: 0.7rem'>
							{#each stations as s} 
								<option value={s.id}>{s.name}</option>
							{/each}
						</Input>
					</FormGroup>
					<FormGroup class="mx-1" floating label="Associated Train (if any)">
						<Input 	type="select" name="train" id="train" bind:value={formData.train}
								style='height: calc(3.5rem + 2px); border-radius: 0.7rem'>
							{#each trains as t} 
								<option value={t.id}>{t.name}</option>
							{/each}
						</Input>
					</FormGroup>
					<FormGroup floating label="Write your complain in details...">
						<Input  type="textarea" name="text" style="border-radius:0.7rem; height: 6rem" 
								id="userid" bind:value={formData.text}/>
					</FormGroup>
					<Button class="w-50 p-2 mx-auto my-4" color="success" style="border-radius:0.7rem"
							on:click={onComplain}> Submit Complaint </Button>
				</Form>
			</div>

			<div class='pt-3 d-flex flex-column comp'>
				<p class ='h2'>My Complaint History</p>
				<Table class='my-2 my-md-3 d-flex flex-column' hover>
					<tbody>
						<tr>
							<th>#</th>
							<th>Complaint ID</th>
							<th>Time of Submission</th>
							<th>Category</th>
						</tr>
						{#each complaints as t, i(i)} 
							<tr class='{sComp==t?"bg-warning":""}'>
								<td>{i+1}</td>
								<td><span 	style="font-family:monospace; cursor:pointer" 
											on:click={() => {sComp = (sComp==t)? null:t}}
											class='text-success text-decoration-underline'> {t.complaint_id} </span>
								</td>
								<td>{(new Date(t.req_time)).toLocaleString()}</td>
								<td>{t.category}</td>
							</tr>
						{/each}
					</tbody>
				</Table>
			</div>
		</div>	

		{#if sComp} 
			<div class='d-flex flex-column px-md-5 w-75 my-md-0 my-4'>
				<p class ='h2 mx-auto'>Complaint Details</p>
				<div class='comp-detail mx-auto'>
					{#if sComp.associated_station}
						<b>Associated Station: </b>
						<p>{sComp.a_st_name}</p>
					{/if}
					{#if sComp.associated_train}
						<b>Associated Train: </b>
						<p>{sComp.a_tr_name}</p>
					{/if}
					<hr>
					<p class='h5 fw-bold'>Message Body: </p>
					<p>{sComp.req_text}</p>
				</div>
			</div>
		{/if} <br><br><br>

	</div>
{:else}
	<div class='d-flex flex-column justify-content-center align-items-center' style="width:100%; height:75vh">
		<p class='h3 text-danger'>To make complaints please log in.</p><br>
	</div>
{/if} 



<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	@media only screen and (max-width: 768px) {
		:global(.comp) {
			width: 90vw;
			margin-left: 5vw;
			margin-right: 5vw;
			margin-top: 4vw;
			margin-bottom: 3.5vw
		}

		:global(.comp-detail) {
			width: 100%;
		}
	}

	@media only screen and (min-width: 768px) {
		:global(.comp) {
			width: 30vw;
			margin-left: 5vw;
			margin-right: 5vw;
			margin-top: 4vw;
			margin-bottom: 1.5vw
		}

		:global(.comp-detail) {
			width: 65%;
			margin-left: 2.5rem;
		}
	}

	:global(.comp-detail) {
		border-radius: 1rem; 
		border: 2px solid;
		border-color: var(--bs-success);
		margin: 1rem;
		padding: 2.5rem;
	}

</style>
