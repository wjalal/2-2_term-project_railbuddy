<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
	import { onMount } from "svelte";
	import { Styles, Form, FormGroup, Input, Button, Icon, Collapse, 
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardSubtitle,
    CardText,
    CardTitle,
	Carousel,
    CarouselControl,
    CarouselIndicators,
    CarouselItem,
    CarouselCaption,
	Col} from "sveltestrap";
	import axios from "axios";
	import TrainInfo from "./ui/TrainInfo.svelte";
	import prettyMilliseconds from 'pretty-ms';


	let formData = {
		from: 0, fromName: '', to: 0, toName: '', reDate: '', class: '',
		date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substring(0, 10),	
	};


	let formStyle = "";
	let stations = [], classes = [], trains = [];

	const server = "http://localhost";


	const replaceBracket = (string) => {
		let index = string.indexOf('(') - 1;
		return string.substring(0, index) + "\n" + string.substring(index + "\n".length);
	};

	onMount (event => {
		axios.defaults.withCredentials = true;
		axios.post(`${server}/api/getStations`).then(res => {
			stations = [{name: ""}, ...res.data];
		}).catch(function (err) {
			console.log(err);
		});
		axios.post(`${server}/api/getClasses`).then(res => {
			classes = res.data;
		}).catch(function (err) {
			console.log(err);
		});
	});

	const fromName = () => {
		let from = document.getElementById("from");
		// @ts-ignore
		return from.options[from.selectedIndex].innerHTML;
	};

	const toName = () => {
		let to = document.getElementById("to");
		// @ts-ignore
		return to.options[to.selectedIndex].innerHTML;
	};

	const onSearch = (event) => {
		event.preventDefault();
		formData.reDate = formData.date;
		axios.get(`${server}/search`, {
			params: {
				from: formData.from,
				to: formData.to,
				date: formData.date,
				class: formData.class
			}
		}).then(res => {
			if (res.data.success === false) {
				alert("No matching trains found!");		
			} else {
				trains = [...res.data.trains];
				console.log(trains);
				formStyle = "flex-md-row"
				document.getElementById("searchform").style.width = "86vw";
				document.getElementById("search-heading").style.textAlign = "center";
				document.getElementById("search-heading").style.marginBottom = "5vh";
			};
		}).catch(function (err) {
			console.log(err);
		});
		window.scrollTo(0, 800);
	};
</script>

<div id="searchform" class="my-5 d-flex flex-column justify-content-center">
	<h2 id="search-heading" class="mt-4">Search and Buy Tickets</h2>
	<Form id = "searchformform" class="my-3 d-flex flex-column {formStyle} justify-content-center">
		<FormGroup class="mx-1" floating label="Start from (Starting station)">
			<Input type="select" name="from" id="from" bind:value={formData.from}>
				{#each stations as st8n} 
					<option value={st8n.id}> 
						{st8n.name + (st8n.name !== "" ? `  (${st8n.district})` : "")}
					</option>
				{/each}
			</Input>
		</FormGroup>
		<FormGroup class="mx-1" floating label="Travel to (Destination station)">
			<Input type="select" name="to" id="to" bind:value={formData.to}>
				{#each stations as st8n} 
				<option value={st8n.id}> 
					{st8n.name + (st8n.name !== "" ? `  (${st8n.district})` : "")}
				</option>
				{/each}
			</Input>
		</FormGroup>
		<FormGroup class="mx-1" floating label="Date of Travel">
			<Input type="date" name="date" id="date" bind:value={formData.date}/>
		</FormGroup>
		<FormGroup class="mx-1" floating label="Class">
			<Input type="select" name="class" id="class" bind:value={formData.class}>
				{#each classes as cls} 
					<option>{cls}</option>
				{/each}
			</Input>
		</FormGroup>
	</Form>
	<Button class="p-2 mx-auto bg-success shadow" style="width:30%" on:click={onSearch}>
		Search &nbsp; <Icon name="search" />
	</Button>
</div>

<br>

<div class="mx-auto" id="train-list">
	{#if trains.length > 0}
		{#each trains as train}
			{#if (new Date(train.next_departure)).toDateString() == (new Date(formData.reDate)).toDateString()}
				<Card class="mb-4 mx-md-5 mx-1 display-flex flex-column border-danger bg-white">
					<CardHeader>
						<CardTitle>
							<b class='alignleft text-danger'>{train.name + " (" + train.id + ")"}</b>
							<Button class='bg-transparent text-dark border-0' style="float:right" id={"tgl" + train.id}>
								<Icon color="danger" name="arrows-collapse" />
							</Button>	
						</CardTitle>
					</CardHeader>
					
					<Collapse toggler={"#tgl" + train.id}>
						<CardBody>
							<CardSubtitle><br>
								<p class="alignleft text-center" style="font-size:0.7rem; white-space:pre-line">
									<b>{replaceBracket(fromName())}</b> <br>
									{(new Date(train.next_departure)).toLocaleTimeString()} <br>
									<small class="text-muted" >{(new Date(train.next_departure)).toDateString()}</small>
								</p>
								<p class="alignright text-center" style="font-size:0.7rem; white-space:pre-line">
									<b>{replaceBracket(toName())}</b> <br>
									{(new Date(train.next_arrival)).toLocaleTimeString()} <br>
									<small class="text-muted" >{(new Date(train.next_arrival)).toDateString()}</small>
								</p>
								<div class="d-flex justify-content-center pt-2">
								<p class="text-uppercase my-1 text-success" style="font-size:0.75rem; white-space:pre-line">
									{prettyMilliseconds((new Date(train.next_arrival)).getTime() - new Date(train.next_departure).getTime())}
								</p></div><hr class="my-0 mx-5"/>
								<br><br><br>
							</CardSubtitle>
							<CardText>
								<TrainInfo train_id = {train.id} date={formData.reDate} server={server}/>
							</CardText>
						</CardBody>

					</Collapse>
					<!-- <CardFooter>Footer</CardFooter> -->
				</Card>
			{/if}
		{/each}
	{/if}
</div>


<style>
	@import "bootstrap.min.css";

	
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


</style>
