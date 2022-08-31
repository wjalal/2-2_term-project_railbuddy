<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
    import { Modal, ModalBody, ModalFooter, ModalHeader, Icon, Button, Card, CardBody, CardFooter, CardHeader, CardSubtitle, 
			 CardText, CardTitle, Container, Row, Collapse, Form, FormGroup, Label, Input} from 'sveltestrap';
    import Flatpickr from 'svelte-flatpickr';
	import Keypad from "./Keypad.svelte";
	import 'flatpickr/dist/flatpickr.css';
	import Select from 'svelte-select';
    import { onMount } from "svelte";
    import dayjs from 'dayjs';
    import axios from 'axios';
	import prettyMilliseconds from 'pretty-ms'; 
    export let server;

    let trains = [];
	const optionIdentifier = 'id';
	const labelIdentifier = 'id';

    let formData = {
		train: '',
		date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substring(0, 10),	
        offset: '',
        hour: '',
        minute: '',
        sec: '',
	};

    function getHour(v = '') {
        const [h, m, s] = v
        .padStart(6, '0')
        .replace(/(\d{2})/g, '$1:')
        .split(':');
        return h;
    }

    function getMinute(v = '') {
        const [h, m, s] = v
        .padStart(6, '0')
        .replace(/(\d{2})/g, '$1:')
        .split(':');
        return m;
    }

    function getSec(v = '') {
        const [h, m, s] = v
        .padStart(6, '0')
        .replace(/(\d{2})/g, '$1:')
        .split(':');
        return s;
    }
    
    onMount (event => {
		
			axios.defaults.withCredentials = true;
			axios.post(`${server}/api/getTrains`).then(res => {
				trains = [...res.data];
			}).then(res => {
				const urlParams = new URLSearchParams(window.location.search);
				;
			}).catch(function (err) {
				console.log(err);
			});
	});

    const setOffs = () => {
        console.log('here start');
        axios.defaults.withCredentials = true;
		axios.post(`${server}/api/setOffset`, {
                train: formData.train,
                date: formData.date,
                interval: `${formData.hour} hour ${formData.minute} minute ${formData.sec} second`
		}).then(res => {
                if (res.data.success === false) console.log("didn't work");
                else {
                    console.log('sent lol');
                };
		}).catch(function (err) {
			//console.log(err);
            console.log('jfgievuehvue');
		});
        console.log('here end');
    };
    
</script>

<div id="updsch" class='px-2 d-flex flex-column justify-content-center align-items-center'>
    <br><br><br><br>
    <div class='d-flex flex-row'>
        <Form id = "updsch1" class="d-flex flex-column justify-content-center mt-0 mx-5">
            <FormGroup class="mx-1" >
                <Label class="text-muted" for="to"><small>Trains</small></Label>
                <Select id = "from"  {labelIdentifier}{optionIdentifier}  items={trains} on:select={e => {formData.train = e.detail.id}}
                        containerStyles='height: calc(3.5rem + 2px); border-radius: 0.7rem' />
            </FormGroup>
            <FormGroup class="mx-1">
                <Label class="text-muted" for="date"><small>Date of Travel</small></Label>
                <Flatpickr 	options={{dateFormat: "Y-m-d", minDate: "today", maxDate: dayjs().add(6, 'day').toDate()}} 
                    bind:formattedValue={formData.date} name="date" value={new Date()} class='rb-datepicker'/>
            </FormGroup>
            <br>
            <p class='text-muted'>
                Please select the time offset to be added to this train on the specified date in case of postponement.</p>
        </Form>
        <div class='mt-5 d-flex flex-column mx-5'>
            <Keypad bind:valw={formData.offset} style="width:60vw"/>
        </div>
    </div> 
	<Button class="p-2 mx-auto bg-success shadow" style="width:30%; border-radius:0.5rem"
        on:click={() => {
        formData.hour= getHour(formData.offset);
        formData.minute= getMinute(formData.offset);
        formData.sec= getSec(formData.offset);
        console.log(formData.hour);
        console.log(formData.minute);
        console.log(formData.sec);
        console.log(formData.train);
        console.log(formData.date);
        console.log(formData.offset);
        setOffs();}}>
		Update Schedule <Icon name="upload" />
	</Button>
 </div>

<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";
    
    :global(#updsch) {
        width: 80vw;
    }

    :global(#updsch1) {
        width: 20vw;
    }
</style>