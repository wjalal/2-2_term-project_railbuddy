<script>
	import { onMount } from "svelte";
	import { Button, Table, Icon, Select, TextField } from "svelte-materialify";
	import { mdiClipboardAccount, mdiEye, mdiEyeOff, mdiFileTableOutline, mdiUpload } from '@mdi/js';
	import axios from "axios";
	// import PurchaseDetails from "./ui/PurchaseDetails.svelte";
	// export let adminType;

	let reportList = {}, isOpen, supportList = [], assignedSupport, filePreview, isPreviewOpen, uploadFile;

	const loadHistory = () => {
		axios.defaults.withCredentials = true;
		let apiRoute = "/api/getReportList";
		// else if (adminType=="support") apiRoute = "/api/getSupportReportList";
		axios.post(apiRoute).then(res => {
			//console.log(res.data);
			reportList =  {...res.data};
			isOpen = Array(reportList.history.length).fill(false);
			isPreviewOpen = Array(reportList.history.length).fill(false);
			// if(adminType=="manager") assignedSupport = Array(reportList.history.length).fill("");
			// else if (adminType=="support") uploadFile = Array(reportList.history.length).fill("");
			filePreview = Array(reportList.history.length).fill("");
			console.log(reportList);
			//const urlParams = new URLSearchParams(window.location.search);
			// if (purchaseData.success === true && urlParams.get('pid') != null) {
			// 	for (let i=0; i < purchaseData.history.length; i++) {
			// 		if (urlParams.get('pid') === purchaseData.history[i].purchase_id) isOpen[i] = true;
			// 	};
			// };
			// window.history.pushState (null, "RailBuddy", "/purchases");
		}).catch(function (err) {
			console.log(err);
		});
		// if (adminType=="manager") {
		// 	axios.post("/api/getSupportMemberList").then(res => {
		// 		console.log(res.data);
		// 		const sList = [...res.data.members];
		// 		sList.forEach(e => {
		// 			supportList.push({
		// 				name: `(${e.userid}) ${e.name}`,
		// 				value: e.userid,
		// 			});
		// 		});
		// 		console.log(supportList);
		// 	}).catch(function (err) {
		// 		console.log(err);
		// 	});
		// };
	};

	onMount (event => {
		//event.preventDefault();
		loadHistory();
	});

	const printDate = date => {
		let str = (new Date(date)).toDateString();
		return (str.substring(4, str.length));
	};

    const onFileNameClick = fileID => {
        
    };

	const onPreview = (i, id) => {
		if (isPreviewOpen[i]) isPreviewOpen[i] = false;
		else {
			axios.post("/api/getFilePreview", {
				file_id : id,
			}).then(res => {
				console.log(res.data);
				filePreview[i] = res.data.html;
			}).catch(function (err) {
				console.log(err);
			});
			isPreviewOpen[i] = true;
		};
	};

	const onAssign = (i, id) => {
		axios.post("/api/assignSupportMember", {
			support_id: assignedSupport[i],
			file_id : id,
		}).then(res => {
			console.log(res.data);
			loadHistory();
		}).catch(function (err) {
			console.log(err);
		});
	};

</script>

<div id="purchaseTable" class="my-5 mx-1 mx-md-5 d-flex flex-column justify-content-center" 
	 style="width:85%; position: absolute; ">
	{#if reportList.success === true}
		<h2 class="m-1 mb-10 mt-5 text-center">My Files</h2>
		<Table class='my-5 mx-auto' hover style="width: 98%">
			<thead>
				<tr>
					<th>#</th>
					<th>File ID</th>
					<th>Owner</th>
					<th>Upload Time</th>
					<th>Download Link</th>
				</tr>
			</thead>
			<tbody>
			{#each reportList.history as p, i(i)}
				<tr>
					<td>{i+1}</td>
					<!-- <td on:click={() => isOpen[i] = !isOpen[i]}>
						<small 	style="font-size: 0.9rem; font-family:monospace; cursor:pointer"
								class='text-success text-decoration-underline'> {p.purchase_id}
					</small></td> -->
                    <td>{p.id}</td>
					<td>{p.owner}</td>
					<td>{(new Date(p.upload_timestamp)).toLocaleString()}</td>
                    <td><small 	style="font-size: 0.9rem; font-family:monospace; cursor:pointer"
								class='text-success text-decoration-underline'> 
								<a 	href={"/api/getUserDoc?rid=" + p.id} target="_blank">
								{p.original_filename}
								</a>
					</small></td>
                    
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
	
	@media only screen and (max-width: 868px) {
		#purchaseTable {
			left: 5%;	
		}		
	}


	@media only screen and (min-width: 868px) {
		#purchaseTable {
			left: 15%;	
		}		
	}
/* 
	.ticket-details {
		background-color: rgb(255, 225, 143);
	} */

</style>
