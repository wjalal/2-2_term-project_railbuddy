<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
	import { onMount } from "svelte";
	import { Styles, Form, FormGroup, Input, Button, Label, Table, Icon, Collapse } from "sveltestrap";
	import axios from "axios";
	import PurchaseDetails from "./ui/PurchaseDetails.svelte";

	let purchaseData = {}, isOpen;

	onMount (event => {
		//event.preventDefault();
		axios.defaults.withCredentials = true;
		axios.post("/api/getPurchases").then(res => {
			//console.log(res.data);
			purchaseData =  {...res.data};
			isOpen = Array(purchaseData.history.length).fill(false);
			console.log(purchaseData);
			const urlParams = new URLSearchParams(window.location.search);
			if (purchaseData.success === true && urlParams.get('pid') != null) {
				for (let i=0; i < purchaseData.history.length; i++) {
					if (urlParams.get('pid') === purchaseData.history[i].purchase_id) isOpen[i] = true;
				};
			};
			window.history.pushState (null, "RailBuddy", "/purchases");
		}).catch(function (err) {
			console.log(err);
		});
	});

	const printDate = date => {
		let str = (new Date(date)).toDateString();
		return (str.substring(4, str.length));
	};


</script>

<div id="purchaseTable" class="my-5 mx-1 mx-md-5 d-flex flex-column justify-content-center">
	{#if purchaseData.success === true}
		<h2 class="m-1">My Purchase History</h2>
		<Table class='my-5 mx-auto' hover style="width: 98%">
			<thead>
				<tr>
					<th>#</th>
					<th>Purchase ID</th>
					<th>Train</th>
					<th>Class</th>
					<th>Date of Travel</th>
					<th>Time of Purchase</th>
					<th>TrxID</th>
					<th>Price</th>
				</tr>
			</thead>
			<tbody>
			{#each purchaseData.history as p, i(i)} 
				<tr class='{isOpen[i]?"bg-warning":""}'>
					<td>{i+1}</td>
					<td on:click={() => isOpen[i] = !isOpen[i]}>
						<small 	style="font-size: 0.9rem; font-family:monospace; cursor:pointer"
								class='text-success text-decoration-underline'> {p.purchase_id}
					</small></td>
					<td>{p.train_name}</td>
					<td>{p.class_name}</td>
					<td>{printDate(p.day_of_travel)}</td>
					<td>{(new Date(p.timestamp)).toLocaleString()}</td>
					<td>{p.trx_id}</td>
					<td>৳{p.price}</td>
				</tr>
				{#if isOpen[i]}<tr class='ticket-details'>
					<td colspan="8">
						<PurchaseDetails purchase_id={p.purchase_id}/>
					</td>
				</tr>{/if}
			{/each}
			</tbody>
		</Table>
	{:else}
		<h2>No user logged in!</h2>
	{/if} 
</div>

<style>

	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	.ticket-details {
		background-color: rgb(255, 225, 143);
	}

</style>
