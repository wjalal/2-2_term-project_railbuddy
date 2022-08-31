<script>
	import { Styles, Form, FormGroup, Input, Button, Label, Table, FormText} from "sveltestrap";
	import axios from "axios";
	import { onMount } from "svelte";
	import { userName } from "../userStore.js";

	let formData = {
		doc: null,
        text: '',
		category: ''
	};

	let requests = [], sRqst = null, rqstTypes = [], currentUser;

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
		axios.post(`${server}/api/getRqstTypes`).then(res1 => {
			rqstTypes = res1.data;
			formData.category = 'Other Request'
			axios.post(`${server}/api/getRequests`).then(res4 => {
				requests = [...res4.data.requests];
				console.log(requests);
			}).catch(err => { console.log(err) });
		}).catch(err => { console.log(err) });
	};

	onMount (event => {
		refreshHistory();
	});

	const onRequest = (event) => {
		event.preventDefault();
		console.log(formData.doc.files)
		const fD = new FormData();
		fD.append("doc", formData.doc.files[0]);
		fD.append("text", formData.text);
		fD.append("category", formData.category);
        if(!formData.doc.files[0] || !formData.text || !formData.category){
            alert("Please fill up all the entries.")
        }
        else{
            axios.post(`${server}/api/makeRequest`, fD, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(res => {
                console.log(res);
                if (res.data.success) {
                    formData.station = null, formData.train = null, formData.text = '', formData.category = ''; 
                    refreshHistory();
                } else {
                    alert("Request Submission Failed!");
                };
            }).catch(err => { console.log(err) });
        }
	};

</script>

<div class='d-flex flex-column justify-content-center align-items-center'>
	<div class='d-flex flex-md-row flex-column justify-content-center align-items-start'>
		<div class='pt-3 d-flex flex-column rqst'>
			<p class ='h2'>New Request</p>
			<Form class="my-2 my-md-3 d-flex flex-column justify-content-center">
				<FormGroup class="mx-1" floating label="Category">
					<Input 	type="select" name="category" id="category" bind:value={formData.category}
							style='height: calc(3.5rem + 2px); border-radius: 0.7rem'>
						{#each rqstTypes as c} 
							<option value={c}>{c}</option>
						{/each}
					</Input>
				</FormGroup>
				{#if currentUser === null} <div class='d-flex flex-column justify-content-center align-items-center'>
					<small class='text-danger'>To make other types of requests please log in.</small><br>
				</div> {/if}
				<FormGroup floating label="Write your request in details...">
					<Input  type="textarea" name="text" style="border-radius:0.7rem; height: 6rem" 
							id="userid" bind:value={formData.text}/>
				</FormGroup>
				<FormGroup class="mx-1">
					<input 	class="form-control" type="file" name="doc" id="doc" bind:this={formData.doc}
							style='border-radius: 0.7rem' /><br>
					<FormText color="muted">
						{#if formData.category === "Foreigner Account Registration"}
							Please attach a document containing the scan copy of the applicant's passport's information pages 
							and Bangladesh visa stamp. Only the information pages will suffice if the applicant holds a 
							passport which is not subject to any visa restrictions from Bangladesh. Type the applicant's
							passport no. and mobile no. for RailBuddy account into the description.
						{:else if formData.category === "Update personal info due to NID correction"}
							Please attach a document containing the scan copy of both sides of your corrected NID and the receipt
							of payment submitted for correction. Type your corrected name / date of birth into the description.
						{:else if formData.category === "Book Tickets on International Train"}
							Please ttach a document containing the scan copy of the passengers' passports' information pages 
							and Indian visa stamps. A valid visa is required to purchase international tickets. The name of the 
							train, date of journey and direction of travel must be specified in the description.
						{:else if formData.category === "Request Refund"}
							Please type your purchase ID and transaction ID into the description. If necessary attach any documents 
							to validate the reason of cancellation. In case of any valid emergency, you may be elligible for a 
							full refund if the refund is requested within 2 days ahead of the journey.
						{:else if formData.category === "Reclaim Occupied NID for New Account"} 
							If you have never created an account on RailBuddy but have found your NID occupied by another user at your 
							first attempt to register, you will be assigned an appointment to your nearest operational railway station 
							(specify in description) to verify your identity and launch an investigation. Please attach a document 
							containing the scan copy of both sides of your NID.
						{:else if formData.category === "Advance Large Booking"} 
							If you need to make a large booking for more than 4 passengers, or reserve entire bogies you can do so on 
							behalf of a registered business, NGO or educational institution. The booking must be requested more than 6 days 
							in advance, i.e. before the ticket is available for online purchase to the public. In the description please 
							specify the your boarding and destination station, date of travel, prefered class of coach and number of 
							passengers/coaches. Please attach a document containing the scan copy of the registration certificate
							of your organisation.
						{:else if formData.category === "Other Request"} 
							Please specify your request in details in the description and attach a file containing any supporting  
							documents that you think may be necessary.
						{/if}
					</FormText>
				</FormGroup>
				<Button class="w-50 p-2 mx-auto my-4" color="success" style="border-radius:0.7rem"
						on:click={onRequest}> Submit Request </Button>
			</Form>
		</div>

		{#if currentUser}
			<div class='pt-3 d-flex flex-column rqst'>
				<p class ='h2'>My Request History</p>
				<Table class='my-2 my-md-3 d-flex flex-column' hover>
					<tbody>
						<tr>
							<th>#</th>
							<th>Request ID</th>
							<th>Time of Submission</th>
							<th>Category</th>
						</tr>
						{#each requests as t, i(i)} 
							<tr class='{sRqst==t?"bg-warning":""}'>
								<td>{i+1}</td>
								<td><span 	style="font-family:monospace; cursor:pointer" on:click={() => {sRqst = (sRqst==t)? null:t}}
											class='text-success text-decoration-underline'> {t.request_id} </span>
								</td>
								<td>{(new Date(t.req_time)).toLocaleString()}</td>
								<td>{t.category}</td>
							</tr>
						{/each}
					</tbody>
				</Table>
			</div>
		{/if}
	</div>	

	{#if sRqst} 
		<div class='d-flex flex-column px-md-5 w-75 my-md-0 my-4'>
			<p class ='h2 mx-auto'>Request Details</p>
			<div class='rqst-detail mx-auto'>
				<b>Attached Supporting Document: </b><br>
				<a  href={"/api/getUserDoc?rid=" + sRqst.request_id} target="_blank"
					class='text-decoration-underline'>{sRqst.docname}</a>
				<hr>
				<p class='h5 fw-bold'>Message Body: </p>
				<p>{sRqst.req_text}</p>
                {#if sRqst.res_text != null }
						<hr>
						<p class='h5 fw-bold'>Response message: </p>
						<p>{sRqst.res_text}</p>
					{/if}
			</div>
		</div>
	{/if} <br><br><br>

</div>



<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	@media only screen and (max-width: 768px) {
		:global(.rqst) {
			width: 90vw;
			margin-left: 5vw;
			margin-right: 5vw;
			margin-top: 4vw;
			margin-bottom: 3.5vw
		}

		:global(.rqst-detail) {
			width: 100%;
		}
	}

	@media only screen and (min-width: 768px) {
		:global(.rqst) {
			width: 30vw;
			margin-left: 5vw;
			margin-right: 5vw;
			margin-top: 4vw;
			margin-bottom: 1.5vw
		}

		:global(.rqst-detail) {
			width: 65%;
			margin-left: 2.5rem;
		}
	}

	:global(.rqst-detail) {
		border-radius: 1rem; 
		border: 2px solid;
		border-color: var(--bs-success);
		margin: 1rem;
		padding: 2.5rem;
	}

</style>
