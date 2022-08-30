<script>
	import { 	Styles, Form, FormGroup, Input, Button, Icon, Collapse, Label, Card, CardBody, CardFooter, CardHeader, CardSubtitle, 
				CardText, CardTitle, Carousel, CarouselControl, CarouselIndicators, CarouselItem, CarouselCaption,
				Modal, ModalBody, ModalFooter, ModalHeader, Badge, Container, Row, Col } from "sveltestrap";
	import axios from "axios";
	import ComplaintAdmin from "./ui/ComplaintAdmin.svelte";
	import ScheduleUpdate from "./ui/ScheduleUpdate.svelte";
	//import ComplaintClient from "./ui/ComplaintClient.svelte";
	let showComplaints = false, scheduleUpdate = false;
	const server = 'http://localhost';
</script>

<div id="admincontrols">
	{#if !showComplaints && !scheduleUpdate}
	<Form class="my-5 d-flex flex-row justify-content-center w-100" >
		<Button class="w-25 p-3 mx-auto adminoptions" color="success" on:click={() => { scheduleUpdate = !scheduleUpdate}}
			>Schedule Controls</Button
		>
        <Button class="w-25 p-3 mx-auto adminoptions" color="success" on:click={() => { showComplaints = !showComplaints}}
			>Respond to Complaint</Button
		>
        <Button class="w-10 p-3 mx-auto adminoptions" color="success"
			>Respond to Requests</Button
		>
        <Button class="w-10 p-3 mx-auto adminoptions" color="success" 
			>Train Edit lol</Button
		>
	</Form>
	{:else if scheduleUpdate}
		<ScheduleUpdate server = {server}/>
		<Button class="mb-4 mx-md-5 mx-1 display-flex flex-column border-danger bg-white" 
		on:click={() => scheduleUpdate = !scheduleUpdate}>Back</Button>
	{:else}
		<ComplaintAdmin server = {server}/>
		<Button class="mb-4 mx-md-5 mx-1 display-flex flex-column border-danger bg-success" 
		on:click={() => showComplaints = !showComplaints}>Back</Button>
	{/if}
</div>



<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	@media only screen and (max-width: 768px) {
		#admincontrols {
			width: 500vw;
			margin: 5vw;
		}
	}

	@media only screen and (min-width: 768px) {
		#admincontrols {
			width: 50vw;
			margin: 5vw;
		}
	}

		:global(.adminoptions) {
			margin: 5vw;
			height: 10rem;
		}
</style>
