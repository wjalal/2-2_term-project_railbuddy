<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
    import { Modal, ModalBody, ModalFooter, ModalHeader, Icon, Button, Card, CardBody, CardFooter, CardHeader, CardSubtitle, 
			 CardText, CardTitle, Container, Row, Collapse, Form, FormGroup, Label, Input} from 'sveltestrap';
    import { onMount } from "svelte";
    import Flatpickr from 'svelte-flatpickr';
	import 'flatpickr/dist/flatpickr.css';
    import dayjs from 'dayjs';
    import axios from 'axios';
	import prettyMilliseconds from 'pretty-ms'; 
    export let server;


	const getRealISODate = (date) => {
		return (new Date(date.getTime() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substring(0, 10);
	};

    let formData = {
		mobile: '',
		name: '',
		dob: getRealISODate(new Date()),
		address: '',
		nid: '',
		password: '',
	};

    const onSubmit = (event) => {
		event.preventDefault();
        axios.defaults.withCredentials = true;
		axios.post(`${server}/api/reclaimNID`, {
			nid: formData.nid,
			dob: formData.dob,
			mobile: formData.mobile,
			password: formData.password,
			name: formData.name,
			address: formData.address
		}).then(res => {
			if (res.data === false) {
				//alert("Server Error");		
				alert("Account creation failed")
			} else {
				alert("Account creation Succeeded")
                window.location.reload();
			};
		}).catch(function (err) {
			alert("Account creation failed")
		});
    };

    
</script>

<div class='aligncenter px-2 d-flex flex-column'>
    <br><br><br><br>
	<div class='d-flex flex-column px-md-5 w-75 mx-auto my-md-0 my-4'>
		<p class='h2 mx-auto'>Reclaim Occupied NID</p>
		<div class='comp-detail mx-auto justify-content-center align-items-center'>
			<Form id = "searchformform" class="my-3 d-flex flex-column">
                <FormGroup class="mx-1" >
					<Label class="text-muted" ><small>NID</small></Label>
					<Input type='text' style='height:3rem; border-radius:0.7rem' bind:value={formData.nid}/>
				</FormGroup> 	
				<FormGroup class="mx-1" >
					<Label class="text-muted" ><small>Mobile No.</small></Label>
					<Input type='tel' style='height:3rem; border-radius:0.7rem' bind:value={formData.mobile}/>
				</FormGroup>
				<FormGroup class="mx-1" >
					<Label class="text-muted" ><small>Temporary Password</small></Label>
					<Input type='tel' style='height:3rem; border-radius:0.7rem' bind:value={formData.password}/>
				</FormGroup>
				<FormGroup class="mx-1" >
					<Label class="text-muted" ><small>Name</small></Label>
					<Input type='text' style='height:3rem; border-radius:0.7rem' bind:value={formData.name}/>
				</FormGroup> 
				<FormGroup class="mx-1" >
					<Label class="text-muted"><small>Date of Birth</small></Label>
					<Flatpickr 	options={{dateFormat: "Y-m-d"}} 
						bind:formattedValue={formData.dob} name="date" value={new Date()} class='rb-datepicker'/> 
				</FormGroup> 
				<FormGroup class="mx-1" >
					<Label class="text-muted" ><small>Address</small></Label>
					<Input type='text' style='height:5rem; border-radius:0.7rem' bind:value={formData.address}/>
				</FormGroup> 				
			</Form>
			<Button class='bg-success text-light mx-auto w-25'  on:click={onSubmit}>
				Submit
			</Button>
		</div>
	</div>

 </div>

<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

    .aligncenter {
		float: center;
	}


</style>