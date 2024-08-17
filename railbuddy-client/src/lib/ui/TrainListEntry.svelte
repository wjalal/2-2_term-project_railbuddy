<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
	import { onMount } from "svelte";
	import { 	Styles, Form, FormGroup, Input, Button, Icon, Collapse, Label, Card, CardBody, CardFooter, CardHeader, CardSubtitle, 
				CardText, CardTitle, Carousel, CarouselControl, CarouselIndicators, CarouselItem, CarouselCaption,
				Modal, ModalBody, ModalFooter, ModalHeader, Badge, Container, Row, Col } from "sveltestrap";
	import axios from "axios";
	import TrainInfo from "./TrainInfo.svelte";
	import prettyMilliseconds from 'pretty-ms';
	import 'flatpickr/dist/flatpickr.css';  

    const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    export let st1_id, st2_id, formData, server, openDetails, trname, trid, de, ar, name1, name2, dist1, dist2;
    let isOpen = false;
</script>

<Card class="mb-1 mx-md-5 mx-1 display-flex flex-column border-danger bg-white train-list-mult">
    <CardHeader>
        <CardTitle>
            <b class='alignleft text-danger mt-2 mr-4'>{trname + " (" + trid + ")"}</b>
            <Button class='bg-transparent text-dark border-0' style="float:right" 
                    on:click={() => isOpen = !isOpen}>
                <Icon color="danger" name="arrows-collapse" />
            </Button>	
        </CardTitle>
    </CardHeader>
    
    <Collapse {isOpen}>
    <CardBody>
        <CardSubtitle><br>
            <p class="alignleft text-center" style="font-size:0.7rem; white-space:pre-line">
                <b>{name1 + "\n" + dist1}</b> <br>
                {(new Date(de)).toLocaleTimeString()} <br>
                <small class="text-muted" >{(new Date(de)).toDateString()}</small>
            </p>
            <p class="alignright text-center" style="font-size:0.7rem; white-space:pre-line">
                <b>{name2 + "\n" + dist2}</b> <br>
                {(new Date(ar)).toLocaleTimeString()} <br>
                <small class="text-muted" >{(new Date(ar)).toDateString()}</small>
            </p>
            <div class="d-flex justify-content-center pt-2">
            <p class="text-uppercase my-1 text-success" style="font-size:0.75rem; white-space:pre-line">
                {prettyMilliseconds((new Date(ar)).getTime() - new Date(de).getTime())}
            </p></div><hr class="my-0 mx-5"/>
            <div class="d-flex justify-content-center pt-2">
            <a class='text-danger' href={null} style='cursor: pointer; font-size: 0.6rem'
                    on:click={openDetails}>(See Details)</a></div>
            <br><br><br>
        </CardSubtitle>
        <CardText>
            <TrainInfo 	train_id={trid} st1_id={st1_id} st2_id={st2_id} 
                        date={formData.reDate} preferedClass={formData.reClass} server={server}/>
        </CardText>
    </CardBody>

    </Collapse>
    <!-- <CardFooter>Footer</CardFooter> -->
</Card>
