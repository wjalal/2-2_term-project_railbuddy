<script>
	import { onMount } from "svelte";
	import { Button, Table, Icon, Select, TextField } from "svelte-materialify";
	import { mdiClipboardAccount, mdiEye, mdiEyeOff, mdiFileTableOutline, mdiUpload } from '@mdi/js';
	import axios from "axios";
	// import PurchaseDetails from "./ui/PurchaseDetails.svelte";

	let userList = {};

	const loadUsers = () => {
		axios.defaults.withCredentials = true;
		let apiRoute = "/api/getUserList";
		// else if (adminType=="support") apiRoute = "/api/getSupportReportList";
		axios.post(apiRoute).then(res => {
			//console.log(res.data);
			userList =  {...res.data};
		}).catch(function (err) {
			console.log(err);
		});
	};

	onMount (event => {
		//event.preventDefault();
		loadUsers();
	});

</script>

<div id="userTable" class="my-5 mx-1 mx-md-5 d-flex flex-column justify-content-center" 
	 style="position: absolute; ">
	{#if userList.success === true}
		<h2 class="m-1 mb-10 mt-5 text-center">Site Users</h2>
		<Table class='my-5 mx-auto' hover style="width: 98%">
			<thead>
				<tr>
					<th>#</th>
					<th>Name</th>
					<th>ID</th>
				</tr>
			</thead>
			<tbody>
			{#each userList.users as p, i(i)}
				<tr>
					<td>{i+1}</td>
					<!-- <td on:click={() => isOpen[i] = !isOpen[i]}>
						<small 	style="font-size: 0.9rem; font-family:monospace; cursor:pointer"
								class='text-success text-decoration-underline'> {p.purchase_id}
					</small></td> -->
                    <td>{p.name}</td>
					<td>{p.userid}</td>                   
				</tr>
			{/each}
			<tr></tr><tr></tr>
			</tbody>
		</Table>
	{:else}
		<h2>No user logged in / No files</h2>
	{/if} 
</div>

<style>
	
	@media only screen and (max-width: 768px) {
		#userTable {
			width: 80%;
			left: 10%;	
		}		
	}


	@media only screen and (min-width: 768px) {
		#userTable {
			width: 50%;
			left: 35%;	
		}		
	}
/* 
	.ticket-details {
		background-color: rgb(255, 225, 143);
	} */

</style>
