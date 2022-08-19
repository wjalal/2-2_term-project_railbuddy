<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
	import { onMount } from "svelte";
	import { 	Styles, Form, FormGroup, Input, Button, Icon, Collapse, Label, Card, CardBody, CardFooter, CardHeader, CardSubtitle, 
				CardText, CardTitle, Carousel, CarouselControl, CarouselIndicators, CarouselItem, CarouselCaption,
				Modal, ModalBody, ModalFooter, ModalHeader, Badge, Container, Row, Col } from "sveltestrap";
	import axios from "axios";
	import TrainInfo from "./ui/TrainInfo.svelte";
	import TrainDetails from "./ui/TrainDetails.svelte";
	import prettyMilliseconds from 'pretty-ms';
	import Flatpickr from 'svelte-flatpickr';
	import 'flatpickr/dist/flatpickr.css';
	import Select from 'svelte-select';
	import dayjs from 'dayjs';

	let formData = {
		from: 0, fromName: '', to: 0, toName: '', reDate: '', class: '', fromDist: '', toDist: '',
		fromInput: null, toInput: null, reClass: '',
		date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substring(0, 10),	
	};

	let detailedTrain;

	const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const optionIdentifier = 'id';
	const labelIdentifier = 'name';
	const groupBy = (station) => station.district;
	let formStyle = "";
	let stations = [], classes = [], trains = [], isOpen, showTrainDetails = false;

	const server = '';

	onMount (event => {
		axios.post(`${server}/api/getClasses`).then(res => {
			classes = res.data;
			formData.class = 'SHOVAN';
		}).then(red => {

			axios.defaults.withCredentials = true;
			axios.post(`${server}/api/getStations`).then(res => {
				stations = [...res.data];
			}).then(res => {
				const urlParams = new URLSearchParams(window.location.search);
				if (urlParams.get('class') != null && urlParams.get('from') != null && urlParams.get('to') != null && urlParams.get('date') != null) {
					console.log(urlParams.get('class'));
					formData.from = Number(urlParams.get('from'));
					formData.to = Number(urlParams.get('to'));
					formData.date = urlParams.get('date');
					formData.class = urlParams.get('class');
					onSearch();
				};
			}).catch(function (err) {
				console.log(err);
			});

		}).catch(function (err) {
			console.log(err);
		});
	});

	const onSearch = () => {
		console.log(stations);
		for (const st of stations) {
            if (st.id == formData.to) formData.toInput = st, formData.toName = st.name, formData.toDist = st.district;
			if (st.id == formData.from) formData.fromInput = st, formData.fromName = st.name, formData.fromDist = st.district;
        };
		formData.reClass = formData.class;
		formData.reDate = formData.date;
		axios.defaults.withCredentials = true;
		axios.post (`${server}/api/search`, {
				from: formData.from,
				to: formData.to,
				date: formData.date,
				class: formData.class
		}).then(res => {
			if (res.data.success === false) {
				alert("No matching trains found!");		
			} else {
				trains = [...res.data.trains];
				isOpen = Array(trains.length).fill(false);
				for (let i=0; i<trains.length; i++) if (trains[i].has_desired_class) isOpen[i] = true;
				console.log(trains);
				formStyle = "flex-lg-row"
				document.getElementById("searchform").style.width = "86vw";
				document.getElementById("search-heading").style.textAlign = "center";
				document.getElementById("search-heading").style.marginBottom = "5vh";
				window.history.pushState (formData, `${formData.fromName} to ${formData.toName} — RailBuddy`, 
								`search?from=${formData.from}&to=${formData.to}&date=${formData.date}&class=${formData.class}`);
			};
		}).catch(function (err) {
			console.log(err);
		});
		window.scrollTo(0, 800);
	};

	const collapse = (i) => {
		isOpen[i] = !isOpen[i];
	};
	
</script>


<div id="searchform" class="my-5 d-flex flex-column justify-content-center">
	<p id="search-heading" class="h2 mt-2 mb-4 mt-md-5"><Icon name="search" />   Search and Buy Tickets</p>
	<Form id = "searchformform" class="my-3 d-flex flex-column {formStyle} justify-content-center">
		<FormGroup class="mx-1" >
			<Label class="text-muted" for="to"><small>Start from (Origin Station)                     </small></Label>
			<Select id = "from" {optionIdentifier} {labelIdentifier} items={stations} {groupBy} on:select={e => {formData.from = e.detail.id}}
					containerStyles='height: calc(3.5rem + 2px); border-radius: 0.7rem' bind:value={formData.fromInput}/>
		</FormGroup>
		{#if formStyle === "flex-lg-row"}
			<Button class="mx-lg-1 mx-auto border-success flimp" color="light" style='border-radius: 0.7rem'
					on:click={e => {e.preventDefault(); [formData.toInput, formData.fromInput] = [formData.fromInput, formData.toInput]}} >
				<Icon class='d-none d-lg-block' name="arrow-left-right" />
				<Icon class='d-block d-lg-none' name="arrow-down-up" />
			</Button>
		{/if}
		<FormGroup class="mx-1">
			<Label class="text-muted" for="to"><small>Travel to (Destination Station)                      </small></Label>
			<Select id="to" {optionIdentifier} {labelIdentifier} items={stations} {groupBy} on:select={e => {formData.to = e.detail.id}}
					containerStyles='height: calc(3.5rem + 2px); border-radius: 0.7rem' bind:value={formData.toInput}/>
		</FormGroup>
		<FormGroup class="mx-1">
			<Label class="text-muted" for="date"><small>Date of Travel</small></Label>
			<Flatpickr 	options={{dateFormat: "Y-m-d", minDate: "today", maxDate: dayjs().add(6, 'day').toDate()}} 
				bind:formattedValue={formData.date} name="date" value={new Date()} class='rb-datepicker'/>
			</FormGroup>
		<FormGroup class="mx-1">
			<Label class="text-muted" for="class"><small>Seating Class</small></Label>
			<Input 	type="select" name="class" id="class" bind:value={formData.class}
					style='height: calc(3.5rem + 2px); border-radius: 0.7rem'>
				{#each classes as cls} 
					<option value={cls}>{cls}</option>
				{/each}
			</Input>
		</FormGroup>
	</Form>
	<Button class="p-2 mx-auto bg-success shadow" style="width:30%; border-radius:0.5rem" on:click={onSearch}>
		Search &nbsp; <Icon name="search" />
	</Button>
</div>

<br>

<div class="mx-auto" id="train-list">
	{#if trains.length > 0}
		{#each trains as train, i(i)}
			<!-- {#if (new Date(train.next_departure)).toDateString() == (new Date(formData.reDate)).toDateString()} -->
				<Card class="mb-4 mx-md-5 mx-1 display-flex flex-column border-danger bg-white">
					<CardHeader>
						<CardTitle>
							<b class='alignleft text-danger mt-2 mr-4'>{train.name + " (" + train.id + ")"}</b>
							<Button class='bg-transparent text-dark border-0' style="float:right" on:click={() => collapse(i)}>
								<Icon color="danger" name="arrows-collapse" />
							</Button>	
						</CardTitle>
					</CardHeader>
					
					<Collapse isOpen={isOpen[i]}>
					<CardBody>
						<CardSubtitle><br>
							<p class="alignleft text-center" style="font-size:0.7rem; white-space:pre-line">
								<b>{formData.fromName + "\n" + formData.fromDist}</b> <br>
								{(new Date(train.next_departure)).toLocaleTimeString()} <br>
								<small class="text-muted" >{(new Date(train.next_departure)).toDateString()}</small>
							</p>
							<p class="alignright text-center" style="font-size:0.7rem; white-space:pre-line">
								<b>{formData.toName + "\n" + formData.toDist}</b> <br>
								{(new Date(train.next_journey_arrival)).toLocaleTimeString()} <br>
								<small class="text-muted" >{(new Date(train.next_journey_arrival)).toDateString()}</small>
							</p>
							<div class="d-flex justify-content-center pt-2">
							<p class="text-uppercase my-1 text-success" style="font-size:0.75rem; white-space:pre-line">
								{prettyMilliseconds((new Date(train.next_journey_arrival)).getTime() - new Date(train.next_departure).getTime())}
							</p></div><hr class="my-0 mx-5"/>
							<div class="d-flex justify-content-center pt-2">
							<a class='text-danger' href={null} style='cursor: pointer; font-size: 0.6rem'
									on:click={() => {detailedTrain = train, showTrainDetails = !showTrainDetails}}>(See Details)</a></div>
							<br><br><br>
						</CardSubtitle>
						<CardText>
							<TrainInfo 	train_id={train.id} st1_id={formData.fromInput.id} st2_id={formData.toInput.id} 
										date={formData.reDate} preferedClass={formData.reClass} server={server}/>
						</CardText>
					</CardBody>

					</Collapse>
					<!-- <CardFooter>Footer</CardFooter> -->
				</Card>
			<!-- {/if} -->
		{/each}
	{/if}
</div>

<Modal class='modal-dialog detail-card' isOpen={showTrainDetails} toggle={() => showTrainDetails = !showTrainDetails} size='xs'>
	<ModalHeader toggle={() => showTrainDetails = !showTrainDetails}>
		<b class='alignleft text-danger'>{detailedTrain.name + " (" + detailedTrain.id + ")"}</b><br>
		<div class='d-flex flex-row mt-5 mb-3'>{#each Array(7) as _, i}
			<Badge class='mx-1' color={detailedTrain.days[(i+2)%7]? 'success':'danger'}>
				<small class='text-uppercase' style="font-size:0.7rem; white-space:pre-line">{dow[i]}</small>
			</Badge>{/each}
		</div>
	</ModalHeader>
	<TrainDetails train={detailedTrain} st1_id={formData.fromInput.id} st2_id={formData.toInput.id} date={formData.reDate} server={server}/>
</Modal>


<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	
	@media only screen and (max-width: 768px) {
		#searchform, #train-list {
			width: 86vw;
			margin-left: 7vw;
		}

	}

	@media only screen and (min-width: 768px) {
		#searchform {
			width: 65vw;
			margin: 5vw;
		}
		#train-list {
			width: 85vw;
			margin-left: 10vw;
		}
	}

	@media only screen and (min-width: 1300px) {
		#searchform {
			width: 40vw;
			margin: 5vw
		}
	}

	.alignleft {
		float: left;
	}
	.alignright {
		float: right;
	}

	@media only screen and (min-width: 992px) {
		:global(.flimp) {
			margin-top: 2rem; 
			height: calc(3.5rem + 2px); 
			width: 3rem; 
		}
	}

	@media only screen and (max-width: 992px) {
		:global(.flimp) {
			width: 2.6rem; 
			margin-top: 0rem;
			margin-bottom: 0.8rem;
			box-shadow: none;
		}
	}


	:global(.rb-datepicker) {
		width:100%; 
		height: calc(3.5rem + 2px); 
		border-radius: 0.7rem; 
		border-width: 1px; 
		border-style: solid !important;
		padding:1rem; 
	}

	:global(input.rb-datepicker:focus-visible) {
		outline-width: 0px !important;
		border-color: rgb(53, 135, 202) !important; 
	} 

	:global(input.rb-datepicker) {
		background-color: white !important;
		border-color: rgb(223, 223, 223) !important; 
	}


</style>
