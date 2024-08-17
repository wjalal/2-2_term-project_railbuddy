<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
	import { Styles, Form, FormGroup, Input, Button, Label, Table, Icon } from "sveltestrap";
	import axios from "axios";
	import PurchaseDetails from "./ui/PurchaseDetails.svelte";
	import { onMount } from "svelte";

	let formData = {
		id: '',
		mobile: '',
        nid: ''
	};

	let purchase, showPurchase = false, showTickets = false;

	const printDate = date => {
		let str = (new Date(date)).toDateString();
		return (str.substring(4, str.length));
	};

	const verif = (show) => {
		axios.post("/api/ticketVerif", {
			mobile: formData.mobile,
			id: formData.id,
		}).then(res => {
			console.log(res);
			if (res.data.success) {
				purchase = {...res.data.purchase}
				showPurchase = true;
				if (show) showTickets = true;
			} else {
				alert("No matching records found!");
			};
		}).catch(function (err) {
			console.log(err);
		});
	}

	onMount (event => {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('tid') != null && urlParams.get('u') != null) {
			formData.id = urlParams.get('tid');
			formData.mobile = urlParams.get('u');
			verif(true);
		};
	})

	const onVerif = (event) => {
		event.preventDefault();
		verif(false);
	};

</script>

<div class='d-flex flex-column justify-content-{showPurchase? "center":"start"} align-items-{showPurchase? "center":"start"}'>
	<div class='d-flex flex-md-row flex-column justify-content-{showPurchase? "center":"start"} align-items-center'>
		<div class='py-3 d-flex flex-column' id="loginform">
			<p class ='h2'>Ticket Verification</p>
			<Form class="my-2 my-md-3 d-flex flex-column justify-content-center">
				<FormGroup floating label="Buyer Account's Mobile Number">
					<Input type="tel" name="userid" style="border-radius:0.7rem" id="userid" bind:value={formData.mobile}/>
				</FormGroup>
				<FormGroup floating label="Purchase ID / Ticket ID">
					<Input type="text" name="password" style="border-radius:0.7rem" id="password" bind:value={formData.id}/>
				</FormGroup>
				<Button class="w-50 p-2 mx-auto my-4" color="success" style="border-radius:0.7rem"
						on:click={onVerif}> Verify Ticket </Button>
			</Form>
		</div>
		{#if showPurchase} <div class='pt-5 mr-5 d-flex flex-column'>
			<Table class='my-2 my-md-3 mx-5 d-flex flex-column' hover>
				<tbody>
					<tr>
						<th>Purchase ID</th>
						<td><small 	style="font-size: 0.9rem; font-family:monospace; cursor:pointer"
							class='text-success text-decoration-underline'> {purchase.purchase_id} </small></td>
					</tr>
					<tr>
						<th>Train</th>
						<td>{purchase.train_name}</td>
					</tr>
					<tr>
						<th>Class</th>
						<td>{purchase.class_name}</td>
					</tr>
					<tr>
						<th>Date of Travel</th>
						<td>{printDate(purchase.day_of_travel)}</td>
					</tr>
					<tr>
						<th>Time of Purchase</th>
						<td>{(new Date(purchase.timestamp)).toLocaleString()}</td>
					</tr>
					<tr>
						<th>TrxID</th>
						<td>{purchase.trx_id}</td>
					</tr>
					<tr>
						<th>Price</th>
						<td>৳{purchase.price}</td>
					</tr>
				</tbody>
			</Table>
			<Button color='warning' style='border-radius:0.7rem' class='w-50 mx-auto'
					on:click={()=> showTickets = true}> Show Ticket Details </Button>
		</div>{/if}
	</div>	

	{#if showPurchase && showTickets} <div class='d-flex flex-column px-md-5 w-75 py-5'>
		<Table class='mx-auto' hover>
			<tbody>
				<tr>
					<th><small>#</small></th>
					<th><small>Ticket ID</small></th>
					<th><small>Passenger Name</small></th>
					<th><small>NID / Passport No. / Birth Certificate No.</small></th>
					<th><small>Seat</small></th>
					<th><small></small></th>
				</tr>
				{#each purchase.tickets as t, i(i)} 
					<tr>
						<td><small>{i+1}</small></td>
						<td><a 	style="font-size: 0.8rem; font-family:monospace; cursor:pointer"
								href={"/api/getTicketPDF?tid=" + t.ticket_id} target="_blank" 
								class='text-success text-decoration-underline'> {t.ticket_id}
						</a></td>
						<td><small>{t.name}</small></td>
						<td><small>{t.person_id}</small></td>
						<td><small>{t.seat}</small></td>
						<td><a  href={"/api/getTicketPDF?tid=" + t.ticket_id} target="_blank" 
								style="font-size: 0.8rem; cursor:pointer" class='text-success text-decoration-underline'>
							Print <Icon name="box-arrow-up-right"/>
						</a></td>
					</tr>
				{/each}
			</tbody>
		</Table>
	</div> {/if}

</div>



<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	@media only screen and (max-width: 768px) {
		#loginform {
			width: 90vw;
			margin: 5vw;
		}
	}

	@media only screen and (min-width: 768px) {
		#loginform {
			width: 30vw;
			margin: 5vw;
		}
	}
</style>
