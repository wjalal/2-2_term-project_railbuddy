<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
	import { onMount } from "svelte";
	import { Styles, Form, FormGroup, Input, Button, Icon,
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
    CarouselCaption} from "sveltestrap";
	import axios from "axios";
	import TrainInfo from "./ui/TrainInfo.svelte";
	// import img1 from "./assets/img1.jpg";
	// import img2 from "./assets/img2.jpg";
	// import img3 from "./assets/img3.jpg";
	// import img4 from "./assets/img4.jpg";
	// import img5 from "./assets/img5.jpg";


	let formData = {
		from: 0,
		to: 0,
		date: '',
		class: ''
	};

	const items = [
		{
			url: "../assets/img1.jpg",
			subTitle: 'Slide 1'
		},
		{
			url: "../assets/img1.jpg",
			subTitle: 'Slide 2'
		},
		{
			url: "../assets/img1.jpg",
			subTitle: 'Slide 3'
		},
		{
			url: "../assets/img1.jpg",
			subTitle: 'Slide 3'
		},
		{
			url: "../assets/img1.jpg",
			subTitle: 'Slide 3'
		}
	];
 	 let activeIndex = 0;



	let formStyle = "";
	let stations = [], classes = [], trains = [];

	const server = "";

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

	const onSearch = (event) => {
		event.preventDefault();
		axios.post(`${server}/api/search`, {
			from: formData.from,
			to: formData.to,
			date: formData.date,
			class: formData.class
		}).then(res => {
			if (res.data.success === false) {
				alert("No matching trains found!");		
			} else {
				trains = [...res.data.trains];
				console.log(trains);
			};
		}).catch(function (err) {
			console.log(err);
		});
		window.scrollTo(0, 800);
	};
</script>

<div id="searchform">
	<h2>Search and Buy Tickets</h2>
	<Form class="my-5 d-flex flex-column {formStyle} justify-content-center">
		<FormGroup floating label="Start from (Starting station)">
			<Input type="select" name="from" id="from" bind:value={formData.from}>
				{#each stations as st8n} 
					<option value={st8n.id}> 
						{st8n.name + (st8n.name !== "" ? `  (${st8n.district})` : "")}
					</option>
				{/each}
			</Input>
		</FormGroup>
		<FormGroup floating label="Travel to (Destination station)">
			<Input type="select" name="to" id="to" bind:value={formData.to}>
				{#each stations as st8n} 
				<option value={st8n.id}> 
					{st8n.name + (st8n.name !== "" ? `  (${st8n.district})` : "")}
				</option>
				{/each}
			</Input>
		</FormGroup>
		<FormGroup floating label="Date of Travel">
			<Input type="date" name="date" id="date" bind:value={formData.date}/>
		</FormGroup>
		<FormGroup floating label="Class">
			<Input type="select" name="class" id="class" bind:value={formData.class}>
				{#each classes as cls} 
					<option>{cls}</option>
				{/each}
			</Input>
		</FormGroup>
		<Button class="w-50 p-2 mx-auto" color="success" on:click={onSearch}>
			Search &nbsp; <Icon name="search" />
		</Button>
	</Form>
</div>
<!-- 
<Carousel {items} bind:activeIndex ride interval={2000}>
	<CarouselIndicators bind:activeIndex {items} />
  
	<div class="carousel-inner">
	  {#each items as item, index}
		<CarouselItem bind:activeIndex itemIndex={index}>
		  <img src={item.url} class="d-block w-100" alt={item.title} />
		  <CarouselCaption
			captionHeader={item.title}
			captionText={item.subTitle}
		  />
		</CarouselItem>
	  {/each}
	</div>
  
	<CarouselControl direction="prev" bind:activeIndex {items} />
	<CarouselControl direction="next" bind:activeIndex {items} />
  </Carousel> -->

<br>
{#if trains.length > 0}
	{#each trains as train}
		<Card class="mb-3 mx-5 display-flex flex-column">
			<CardHeader>
			<CardTitle>{train.name + " (" + train.id + ")"}</CardTitle>
			</CardHeader>
			<CardBody>
			<CardSubtitle>
				<p class="alignleft">{train.oname + " (" + train.origin + ")"}</p>
  				<p class="alignright">{train.dname + " (" + train.dest + ")"}</p>
				<br><br><br>
			</CardSubtitle>
			<CardText>
				<div class='d-flex flex-md-row flex-column justify-content-start'>
					<TrainInfo train_id = {train.id} />
				</div>
			</CardText>
			</CardBody>
			<!-- <CardFooter>Footer</CardFooter> -->
		</Card>
	{/each}
{/if}


<style>
	
	@media only screen and (max-width: 768px) {
		#searchform {
			width: 90vw;
			margin: 5vw;
		}
	}

	@media only screen and (min-width: 768px) {
		#searchform {
			width: 30vw;
			margin: 5vw;
		}
	}

	.alignleft {
		float: left;
	}
	.alignright {
		float: right;
	}
</style>
