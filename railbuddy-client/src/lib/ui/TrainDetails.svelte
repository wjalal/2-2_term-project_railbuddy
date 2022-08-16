<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
    import { Modal, ModalBody, ModalFooter, ModalHeader, Icon, Button, Card, CardBody, CardFooter, CardHeader, CardSubtitle, 
			 CardText, CardTitle, Container, Row, Col} from 'sveltestrap';
    import { onMount } from "svelte";
    import TreeView from './TreeView.svelte';
	import TreeBranch from './TreeBranch.svelte';
	import TreeLeaf from './TreeLeaf.svelte';
    import axios from 'axios';
	import prettyMilliseconds from 'pretty-ms'; 
    export let train, st1_id, st2_id, date, server;

    let stops = [];
    onMount (event => {
		axios.defaults.withCredentials = true;
		axios.post(`${server}/api/getRoute`, {
			train_id: train.id,
            st1_id: st1_id,
            st2_id: st2_id,
            date: date
		}).then(res => {
			if (res.data.success === false) {
				alert("Server Error");		
                window.location.reload();
			} else {
				stops = [...res.data.route];
				console.log(stops);
			};
		}).catch(function (err) {
			console.log(err);
		});
	});

</script>

<ModalBody class='px-2 d-flex flex-column'>
	<TreeView lineColor="var(--bs-success)" iconBackgroundColor="#ff0000" iconColor="#00ff00">
		{#each stops as stop}
		<TreeLeaf>
			<Card class='border-success border-2 mb-1 bg-light route-card' >
				<CardHeader>
					<CardTitle>{`${stop.station_name} (${stop.station_id})`}</CardTitle>
				</CardHeader>
				<CardBody>
					<Container>
						<Row class='p-1'>
							{#if stop.arrival_time !== null}
							<Col><p class="alignleft text-center" style="font-size:0.8rem; white-space:pre-line">
								Arrival
								<b class='text-success mt-1'>
									{(new Date(stop.arrival_time)).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</b>
							</p></Col>{/if}
							{#if stop.arrival_time !== null && stop.depart_time !== null && stop.arrival_time != stop.depart_time }
							<Col><p class="text-center" style="font-size:0.8rem; white-space:pre-line">
								Halt
								<b class='mt-1'>{ prettyMilliseconds(
									(new Date(stop.depart_time)).getTime() - (new Date(stop.arrival_time)).getTime(),
									{verbose: true} 
								)}</b>
							</p></Col>{/if}
							{#if stop.depart_time}
							<Col><p class="alignleft text-center" style="font-size:0.8rem; white-space:pre-line">
								Departure
								<b class='text-success mt-1'>
									{(new Date(stop.depart_time)).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</b>
							</p></Col>{/if}
						</Row>
					</Container>
				</CardBody>
			</Card>
		</TreeLeaf>
		{/each}
	</TreeView>
</ModalBody>
<ModalFooter>
  
</ModalFooter>

<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	:global(.route-card) {
		width: 20rem;
	}
</style>