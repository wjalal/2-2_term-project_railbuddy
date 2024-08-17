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
		title: '',
        text: '',
        vt: getRealISODate(new Date())
	};

    const postNotice = (event) => {
		event.preventDefault();
        axios.defaults.withCredentials = true;
		axios.post(`${server}/api/postNotice`, {
                text: formData.text,
				vt: formData.vt,
                title: formData.title
		}).then(res => {
			if (res.data.success === false) {
                console.log('okay wtf');
				//alert("Server Error");		
                //window.location.reload();
			} else {
				console.log('sent lol');
                window.location.reload();
			};
		}).catch(function (err) {
			console.log(err);
            console.log('jfgievuehvue');
		});
    };

    
</script>

<div class='aligncenter px-2 d-flex flex-column'>
    <br><br><br><br>
	<div class='d-flex flex-column px-md-5 w-100 my-md-0 my-4'>
		<div class='comp-detail mx-auto'>
				
		
			<Form id = "searchformform" class="my-3 d-flex flex-column">
				<FormGroup class="mx-1" >
					<Label class="text-muted" for="to"><small>Notice Title</small></Label>
					<Input type='text' style='height:3.5rem' bind:value={formData.title}/>
				</FormGroup>
				<FormGroup class="mx-1" >
					<Label class="text-muted" for="to"><small>Declare New Notice</small></Label>
					<Input type='textarea' style='height:6rem' bind:value={formData.text}/>
				</FormGroup> 
				<FormGroup class="mx-1" >
					<Label class="text-muted" for="date"><small>Valid Until</small></Label>
					<Flatpickr 	options={{dateFormat: "Y-m-d", minDate: "today", maxDate: dayjs().add(15, 'day').toDate()}} 
						bind:formattedValue={formData.vt} name="date" value={new Date()} class='rb-datepicker'/> 
				</FormGroup> 
											
			</Form>
			<Button class='bg-success text-light'  on:click={postNotice}>
				Post Notice
			</Button>
		</div>
	</div>

 </div>

<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	:global(.route-card) {
		width: 20rem;
	}

    .aligncenter {
		float: center;
	}

    
    @media only screen and (max-width: 768px) {
		:global(.comp) {
			width: 90vw;
			margin-left: 5vw;
			margin-right: 5vw;
			margin-top: 4vw;
			margin-bottom: 3.5vw
		}

		:global(.comp-detail) {
			width: 100%;
		}
	}

	@media only screen and (min-width: 768px) {
		:global(.comp) {
			width: 30vw;
			margin-left: 5vw;
			margin-right: 5vw;
			margin-top: 4vw;
			margin-bottom: 1.5vw
		}

		:global(.comp-detail) {
			width: 65%;
			margin-left: 2.5rem;
		}
	}

	:global(.comp-detail) {
		border-radius: 1rem; 
		border: 2px solid;
		border-color: var(--bs-success);
		margin: 1rem;
		padding: 2.5rem;
	}


</style>