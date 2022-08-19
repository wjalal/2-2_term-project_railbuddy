<!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous"> -->
<script>
    import { onMount } from "svelte";
	import { Styles, Label, Form, FormGroup, Input, Button, Icon, Container, Row, Col, Modal, 
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardSubtitle,
    CardText,
    CardTitle } from "sveltestrap";
	import axios from "axios";
    import { userName } from "../../userStore.js";
    export let server;
    export let train_id;
    export let st1_id, st2_id, date;
    export let preferedClass;

    let currentUser, coaches = [], showSeats = false, displayBogies = [], sCoach, sBogie = '', sBogieObj = {}, 
        selMat, selCount = 0, selList = [], ticketStr = "", showBuyWindow = false, route = [], bStation = 0;
    
    userName.subscribe(value => {
		currentUser = value;
	});

    const getSBogie = () => {    
        for (const bogie of displayBogies) {
            if (bogie.coach == sBogie) {
                sBogieObj = bogie;
                break;
            };
        };
    };

    $: sBogie && getSBogie();

    const init_selMat = () => {
        selCount = 0;
        selMat = {};
        displayBogies.forEach(bogie => {
            const L = bogie.coach;
            console.log(sBogieObj);
            selMat[L] = new Array(bogie.mat_row);
            for (let i=0; i<bogie.mat_row; i++) {
                selMat[L][i] = new Array(bogie.mat_col);
                for (let j=0; j<bogie.mat_col; j++) {
                    selMat[L][i][j] = false;
                };
            };
        });
    };

    const clickSeat = (i, j) => {
        if (!sBogieObj.vacancy[i][j]) {
            console.log(selMat, selList);
            const L = sBogieObj.coach;
            if (selMat[L][i][j] === false) {
                if (selCount < 4) {
                    selMat[L][i][j] = true, selCount++;
                    selList.push({label: `${sBogieObj.coach}-${sBogieObj.mat[i][j]}`, L: L, r: i, c: j, pname: '', pid: ''});
                    ticketStr = showTickets();
                };
            } else {
                if (selCount > 0) selMat[L][i][j] = false, selCount--, selList.pop(), ticketStr = showTickets();
            };
        };
    };

    const showTickets = () => {
        let r = "";
        for (let i=0; i<selCount; i++) r += selList[i].label + (i<selCount-1? "  •  ":""); 
        return r;
    };

    onMount (event => {
		axios.defaults.withCredentials = true;
		axios.post(`${server}/api/getCoaches`, {
			id: train_id,
            date: date,
            st1_id: st1_id,
            st2_id: st2_id
		}).then(res => {
			if (res.data.success === false) {
				alert("Server Error");		
                window.location.reload();
			} else {
				coaches = [...res.data.classes];
                route = [...res.data.route];
                bStation = route[0].station_id;
				console.log(coaches, route);
			};
		}).catch(function (err) {
			console.log(err);
		});
	});

    const onCheckSeats = (coach) => {
        axios.defaults.withCredentials = true;
		axios.post(`${server}/api/checkSeats`, {
			class_id: coach.class_id,
            date: date
		}).then(res => {
			if (res.data.success === false) {
				alert("Server Error");		
                window.location.reload();
			} else {
				console.log(res.data.bogies);
                displayBogies = res.data.bogies;
                sCoach = coach;
                sBogie = displayBogies[0].coach;
                getSBogie();
                init_selMat();
                console.log(selMat);
                selList = [], ticketStr = "";
                showSeats = true;
			};
		}).catch(function (err) {
			console.log(err);
		});
    };

    const fillSelfDetails = (event) => {
        event.stopPropagation();
        event.preventDefault();
        axios.defaults.withCredentials = true;
		axios.post(`${server}/api/getSelfID`).then(res => {
            if (res.data.success === true) selList[0].pname = res.data.name, selList[0].pid = res.data.nid;
            else alert ("Server Error");
        }).catch(function (err) {
			console.log(err);
		});
    };

    const onBuy = (event) => {
        event.stopPropagation();
        event.preventDefault();
        if(confirm("Are you sure you want to place this order?")) {
            axios.defaults.withCredentials = true;
            axios.post(`${server}/api/initPurchase`, {
                class_id: sCoach.class_id,
                date: date,
                bStation: bStation,
                seatList: [...selList],
                hostname: window.location.origin,
                qString: window.location.href.substring(window.location.origin.length + 7, window.location.href.length)
            }).then(res => {
                console.log(res);
                window.location.replace(res.data);
            }).catch(function (err) {
			    console.log(err);
		    });   
        };
    };
</script>

<Modal body header="Buy Tickets" isOpen={showBuyWindow} toggle={() => showBuyWindow = !showBuyWindow}>
    <small>Passengers may be asked to show valid identification at the time of boarding or at any point during their journey.</small><br>
    <Form class="my-5 d-flex flex-column justify-content-center">
    {#each selList as s, i(i)}
        <div><Label class="text-dark fw-bold mb-1" for="to"><small>Passenger {i+1}</small></Label>
        {#if i==0} <Button color='light' class='mb-1 border-success' style='float:right' on:click={(event) => fillSelfDetails(event)}>
            <small style='font-size: 0.7rem'>Insert my own details</small>
        </Button>{/if}</div>
        <FormGroup floating label="Name">
            <Input type="text" name='pname{i}' id='pname{i}' bind:value={s.pname}/>
        </FormGroup>
        <FormGroup floating label="NID / Passport No. / Birth Certificate No.">
            <Input type="text" name='pid{i}' id='pid{i}' bind:value={s.pid}/>
        </FormGroup><br>
    {/each }
    <FormGroup>
        <Label class="text-dark fw-bold mb-1" for="to"><small>Boarding Station</small></Label>
        <Input type="select" name='bStation' id='bStation' bind:value={bStation}>
            {#each route as r} 
                {#if r.station_id != st2_id }<option value={r.station_id}> {r.station_name} </option> {/if}
            {/each}
        </Input>
    </FormGroup><br>
    <Button class='w-50 fw-bold bg-success mx-auto p-2' 
            on:click={(event) => onBuy(event)}>Pay ৳{(sCoach.fare * selCount).toFixed(2)}</Button>
    </Form>
</Modal>

<div class='d-flex flex-xl-{showSeats ? "row":"row"} flex-column justify-content-center align-items-center align-items-xl-start'>
{#each coaches as coach}
    <div id="card-div">
    <Card   class='shadow mb-4 mx-xl-2 mx-auto text-center border-{coach.capacity>0? 
                                                                    (coach.vacancy/coach.capacity>0.1? 
                                                                        "success" 
                                                                        :"warning")
                                                                    :"danger border-2"} {coach.class_name === preferedClass? "border-3":""}' 
            style='{showSeats && sCoach === coach ? "width:30vh":""}; border-radius: 1.5rem'>
        <CardHeader >
            <CardTitle class='{coach.class_name === preferedClass? "fw-bold":""}'>{coach.class_name}</CardTitle>
        </CardHeader>
        <CardBody>
            <CardText>
                <big class="text-success"><b>৳{coach.fare}</b></big>
            </CardText>
            <CardSubtitle>
                <small class="text-muted mb-3">
                    {(coach.class_name == 'AC_S' || coach.class_name == 'AC_B' || coach.class_name == 'SNIGDHA')? "+15% VAT" :  " " }
                </small>
            </CardSubtitle>
            <br>
            <p class='text-center text-black-50 text-uppercase mb-0' style='font-size: 0.8rem'>Total Capacity &nbsp;: 
                <b class='text-dark'>{coach.capacity}</b></p>
            <p class='text-center text-secondary text-uppercase'style='font-size: 0.7rem'>Current Vacancy : 
                <b class='text-success'>{coach.vacancy}</b></p>
            {#if showSeats && sCoach === coach}
            <div class="d-flex flex-column justify-content-center mx-auto w-100 my-4">
                <FormGroup floating label="Select Bogie">
                    <Input type="select" name="bogie" id="bogie" bind:value={sBogie}>
                        {#each displayBogies as bogie (bogie.coach)} 
                            <option value={bogie.coach}> {bogie.coach} </option>
                        {/each}
                    </Input>
                </FormGroup><br>
                <small class="mx-auto text-muted mb-2">
                    {#if selCount === 0} Select seats (Upto 4)
                    {:else} {selCount} seats selected (Upto 4 allowed)<br> 
                        <small class='text-success' style="font-size: 0.7rem; white-space: pre">{ticketStr}</small><br><br>
                        {#if currentUser != null}
                            <Button class='border-danger' color='warning' style='border-radius: 0.7rem' 
                                    on:click={() => showBuyWindow = !showBuyWindow}>
                                <Icon name='cart-check-fill'/> <small style="font-size: 0.7rem">Buy Now</small>
                            </Button> 
                        {:else} <small class='text-danger' style="font-size: 0.6rem">Sign in to buy tickets</small><br>
                        {/if}
                    {/if}
                </small>
                <Container>
                {#each Array(sBogieObj.mat_row) as _, i}
                    <Row>
                    {#each Array(sBogieObj.mat_col) as _, j}
                        <Col class="p-1 flex-fil">
                            {#if sBogieObj.mat[i][j] !== 0}
                            <Button class='px-0 py-1 my-1 w-100 bg-{sBogieObj.vacancy[i][j]? "danger":(selMat[sBogie][i][j]?"success":"light")} border-dark'
                                    on:click={() => clickSeat(i,j)} >
                                <div class='text-{selMat[sBogie][i][j] || sBogieObj.vacancy[i][j]?"light":"dark"} text-center' 
                                        style='font-size: {sBogieObj.mat_col>5? 0.5:0.6}rem; white-space:pre-line; line-height:1.3'>
                                    <b>{sBogieObj.coach + '\n' + sBogieObj.mat[i][j]}</b>
                                </div>
                            </Button>
                            {:else}<small style="font-size: 0.6rem"> </small>{/if}
                        </Col>
                    {/each}
                    </Row>
                {/each}
                </Container>
            </div>
            {/if}
        </CardBody>
        <CardFooter>
            <Button class='{showSeats && coach === sCoach?  "text-dark border-success border-2 bg-white"
                                                            :(coach.vacancy/coach.capacity>0.1? "bg-success":"bg-warning")} w-75 mx-auto mx-md-4' 
                    style='border-radius: 0.8rem'
                    on:click={() => onCheckSeats(coach)}>
                {showSeats && coach === sCoach? "Refresh" : "Check Seats"}
            </Button> 
        </CardFooter> 
    </Card>
    </div>
{/each}
</div>

<style>
    @import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

    @media only screen and (max-width: 768px) {
		#card-div {
			width: 85%;
		}
	}

    @media only screen and (min-width: 768px) {

	}


</style>