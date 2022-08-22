<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
	import { onMount } from "svelte";
	import { 	Styles, Form, FormGroup, Input, Button, Icon, Collapse, Label, Card, CardBody, CardFooter, CardHeader, CardSubtitle, 
				CardText, CardTitle, Carousel, CarouselControl, CarouselIndicators, CarouselItem, CarouselCaption,
				Modal, ModalBody, ModalFooter, ModalHeader, Badge, Container, Row, Col, Spinner } from "sveltestrap";
	import axios from "axios";
	import TrainInfo from "./ui/TrainInfo.svelte";
	import TrainDetails from "./ui/TrainDetails.svelte";
	import TrainListEntry from "./ui/TrainListEntry.svelte";
	import prettyMilliseconds from 'pretty-ms';
	import Flatpickr from 'svelte-flatpickr';
	import 'flatpickr/dist/flatpickr.css';
	import Select from 'svelte-select';
	import dayjs from 'dayjs';
	import { loading } from '../userStore';

	const getRealISODate = (date) => {
		return (new Date(date.getTime() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substring(0, 10);
	};

	let formData = {
		from: 0, fromName: '', to: 0, toName: '', reDate: '', class: '', fromDist: '', toDist: '',
		fromInput: null, toInput: null, reClass: '',
		date: getRealISODate(new Date()),	
	};

	let detailedTrain, detail = {}, showSpinner;

	loading.subscribe(value => {
		showSpinner = value;
	});
		

	const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const optionIdentifier = 'id';
	const labelIdentifier = 'name';
	const groupBy = (station) => station.district;
	let formStyle = "", connMode = "DIRECT";
	let stations = [], classes = [], trains = [], routes = [], isOpen, showTrainDetails = false;

	const server = 'http://localhost';

	axios.interceptors.request.use(
      (config) => {
        loading.set(true);
        return config;
      },
      (error) => {
        loading.set(false);
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => {
        loading.set(false);
        return response;
      },
      (error) => {
        loading.set(false);
        return Promise.reject(error);
      }
    );

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

	const onMultConn = (res, mode) => {
		connMode = "NONE";
		routes = [...res.data.routes];
		//console.log(routes);
		let promises = [], responses = [];
		axios.defaults.withCredentials = true;
		for (let i=0; i<routes.length; i++) {
			promises.push (
				axios.post (`${server}/api/getConnTrains`, {
					tr_id1: routes[i].tr_id1,
					tr_id2: routes[i].tr_id2,
					tr_id3: routes[i].tr_id3
				}).then(resp => {
					responses.push(resp);
				})
			);
		};
		Promise.all(promises).then(() => {	
			for (const st of stations) {
				if (st.id == formData.to) formData.toInput = st, formData.toName = st.name, formData.toDist = st.district;
				if (st.id == formData.from) formData.fromInput = st, formData.fromName = st.name, formData.fromDist = st.district;
			};
			formData.reClass = formData.class;
			formData.reDate = formData.date;
			
			console.log(responses);
			for (let i=0; i<responses.length; i++) {	
				if (mode==="CONN_2") for (const st of stations) if (st.id == routes[i].md_st) routes[i].md_st_dist = st.district;
				if (mode==="CONN_3") for (const st of stations) {
					if (st.id == routes[i].md_st1) routes[i].md_st1_dist = st.district;
					if (st.id == routes[i].md_st2) routes[i].md_st2_dist = st.district;
				};
				for (const t of responses[i].data.trains) {
					if (t.id === routes[i].tr_id1) routes[i].tr_1 = t;
					if (t.id === routes[i].tr_id2) routes[i].tr_2 = t;
					if (mode==="CONN_3" && t.id === routes[i].tr_id3) routes[i].tr_3 = t;
				};
				routes[i].tr_1.isOpen = false;
				routes[i].tr_2.isOpen = false;
				if (mode==="CONN_3") routes[i].tr_3.isOpen = false;
			};
			formStyle = "flex-lg-row"
			document.getElementById("searchform").style.width = "86vw";
			document.getElementById("search-heading").style.textAlign = "center";
			document.getElementById("search-heading").style.marginBottom = "5vh";
			window.history.pushState (formData, `${formData.fromName} to ${formData.toName} — RailBuddy`, 
							`search?from=${formData.from}&to=${formData.to}&date=${formData.date}&class=${formData.class}`);
			connMode = mode;
		}).catch(err => { console.log(err) });
		console.log(routes);
	};

	const onSearch = () => {
		console.log(stations);
		axios.defaults.withCredentials = true;
		axios.post (`${server}/api/search`, {
				from: formData.from,
				to: formData.to,
				date: formData.date,
				class: formData.class
		}).then(res => {
			if (res.data.success === false) {
				axios.defaults.withCredentials = true;
				axios.post (`${server}/api/searchConnections2`, {
						from: formData.from,
						to: formData.to,
						date: formData.date,
						class: formData.class
				}).then(res2 => {
					if (res2.data.success === false) {
						if (confirm("No direct or two-train connections found on specified date. Would you like to view routes that connect more than two trains?" +
									"\nThis calculation can take from one to serval minutes and we recommend you to check if there are direct trains" +
									" or two-train connections on alternative nearby dates before resorting to this.")) {
							axios.defaults.withCredentials = true;
							axios.post (`${server}/api/searchConnections3`, {
									from: formData.from,
									to: formData.to,
									date: formData.date,
									class: formData.class
							}).then(res3 => {
								if (res3.data.success === false) alert("No possible connections found between requested stations.");
								else onMultConn(res3, "CONN_3");
							}).catch(err => { console.log(err) });
						};	
					} else onMultConn(res2, "CONN_2");
				}).catch(err => { console.log(err) });
			} else {
				for (const st of stations) {
					if (st.id == formData.to) formData.toInput = st, formData.toName = st.name, formData.toDist = st.district;
					if (st.id == formData.from) formData.fromInput = st, formData.fromName = st.name, formData.fromDist = st.district;
				};
				formData.reClass = formData.class;
				formData.reDate = formData.date;
				connMode = "NONE";
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
				connMode = "DIRECT";
			};
		}).catch(err => { console.log(err) });
	};

	const collapse = (i) => {
		isOpen[i] = !isOpen[i];
	};
	
	const openDetails = (train, st1, st2, date) => { 
		detailedTrain = train;
		detail.st1 = st1, detail.st2 = st2, detail.date = date;
		showTrainDetails = !showTrainDetails; 
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

{#if connMode === "DIRECT"}<div class="mx-auto train-list">
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
									on:click={()=>openDetails(train, formData.fromInput.id, formData.toInput.id, formData.reDate)}>(See Details)</a></div>
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

{:else if connMode==="CONN_2"} <div class="mx-auto d-flex flex-column align-items-center train-list">
	{#each routes as route, i(i)}
		<p class='h4 text-dark fw-bold text-uppercase'>Route-{i+1}</p>
		<p class='p text-success fw-bold text-uppercase'> 
			{prettyMilliseconds((new Date(route.ar2)).getTime() - new Date(route.de1).getTime())} 
			({prettyMilliseconds((new Date(route.de2)).getTime() - new Date(route.ar1).getTime())} waiting)</p>
		<TrainListEntry st1_id={formData.fromInput.id} st2_id={route.md_st} formData={formData} server={server}
						openDetails={()=>openDetails(route.tr_1, formData.fromInput.id, route.md_st, getRealISODate(new Date(route.de1)))} 
						trname={route.tr_1.name} trid={route.tr_id1} de={route.de1} ar={route.ar1}
						name1={formData.fromName} dist1={formData.fromDist} name2={route.md_st_name} dist2={route.md_st_dist}/>
		<div><p class='h1 text-danger my-0'><Icon name='arrow-down-square-fill'/></p></div>
		<TrainListEntry st1_id={route.md_st} st2_id={formData.toInput.id} formData={formData} server={server}
						openDetails={()=>openDetails(route.tr_2, route.md_st, formData.toInput.id, getRealISODate(new Date(route.de2)))} 
						trname={route.tr_2.name} trid={route.tr_id2} de={route.de2} ar={route.ar2}
						name2={formData.toName} dist2={formData.toDist} name1={route.md_st_name} dist1={route.md_st_dist}/>
		<br><br><br>
	{/each}
</div>

{:else if connMode==="CONN_3"} <div class="mx-auto d-flex flex-column align-items-center train-list">
	{#each routes as route, i(i)}
		{#if routes.length > 1}<p class='h4 text-dark fw-bold text-uppercase'>Route-{i+1}</p>{/if}
		<small class='text-success fw-bold text-uppercase'> 
			{prettyMilliseconds((new Date(route.ar3)).getTime() - new Date(route.de1).getTime())} 
			({prettyMilliseconds((new Date(route.de2)).getTime() - new Date(route.ar1).getTime())} + 
			{prettyMilliseconds((new Date(route.de3)).getTime() - new Date(route.ar2).getTime())} waiting)</small>
		<TrainListEntry st1_id={formData.fromInput.id} st2_id={route.md_st1} formData={formData} server={server}
						openDetails={()=>openDetails(route.tr_1, formData.fromInput.id, route.md_st1, getRealISODate(new Date(route.de1)))} 
						trname={route.tr_1.name} trid={route.tr_id1} de={route.de1} ar={route.ar1}
						name1={formData.fromName} dist1={formData.fromDist} name2={route.md_st1_name} dist2={route.md_st1_dist}/>
		<div><p class='h1 text-danger my-0'><Icon name='arrow-down-square-fill'/></p></div>
		<TrainListEntry st1_id={route.md_st1} st2_id={route.md_st2} formData={formData} server={server}
						openDetails={()=>openDetails(route.tr_2, route.md_st1, route.md_st2, getRealISODate(new Date(route.de2)))} 
						trname={route.tr_2.name} trid={route.tr_id2} de={route.de2} ar={route.ar2}
						name1={route.md_st1_name} dist1={route.md_st1_dist} name2={route.md_st2_name} dist2={route.md_st2_dist}/>
		<div><p class='h1 text-danger my-0'><Icon name='arrow-down-square-fill'/></p></div>
		<TrainListEntry st1_id={route.md_st1} st2_id={formData.toInput.id} formData={formData} server={server}
						openDetails={()=>openDetails(route.tr_3, route.md_st1, formData.toInput.id, getRealISODate(new Date(route.de3)))} 
						trname={route.tr_3.name} trid={route.tr_id3} de={route.de3} ar={route.ar3}
						name2={formData.toName} dist2={formData.toDist} name1={route.md_st2_name} dist1={route.md_st2_dist}/>
		<br><br><br>
	{/each}
</div>{/if}

<Modal class='modal-dialog detail-card' isOpen={showTrainDetails} toggle={() => showTrainDetails = !showTrainDetails} size='xs'>
	<ModalHeader toggle={() => showTrainDetails = !showTrainDetails}>
		<b class='alignleft text-danger'>{detailedTrain.name + " (" + detailedTrain.id + ")"}</b><br>
		<div class='d-flex flex-row mt-5 mb-3'>{#each Array(7) as _, i}
			<Badge class='mx-1' color={detailedTrain.days[(i+2)%7]? 'success':'danger'}>
				<small class='text-uppercase' style="font-size:0.7rem; white-space:pre-line">{dow[i]}</small>
			</Badge>{/each}
		</div>
	</ModalHeader>
	<TrainDetails train={detailedTrain} st1_id={detail.st1} st2_id={detail.st2} date={detail.date} server={server}/>
</Modal>


{#if showSpinner}  <div style='position: fixed; left: 0; top: 0; width:100vw; height:100vh; background-color:rgba(0,0,0,0.5)' 
						toggle={()=>{}} size='xs'>
	<Spinner color='light' style="width: 33vh; height: 33vh; position:fixed; top:33vh; left: 50vw; margin-left:-17.5vh"/>
</div> {/if}

<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	
	@media only screen and (max-width: 768px) {
		:global(#searchform) {
			width: 86vw;
			margin-left: 7vw;
		}

		:global(.train-list) {
			width: 86vw;
			margin-left: 7vw;
		}

		:global(.train-list-mult) {
			width: 80vw;
			margin-left: 7vw;
		}

	}

	@media only screen and (min-width: 768px) {
		#searchform {
			width: 65vw;
			margin: 5vw;
		}
		:global(.train-list) {
			width: 85vw;
			margin-left: 10vw;
		}
		:global(.train-list-mult) {
			width: 73vw;
			margin-left: 10vw;
		}
	}

	@media only screen and (min-width: 1300px) {
		#searchform {
			width: 40vw;
			margin: 5vw
		}
	}

	:global(.alignleft) {
		float: left;
	}
	:global(.alignright) {
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
