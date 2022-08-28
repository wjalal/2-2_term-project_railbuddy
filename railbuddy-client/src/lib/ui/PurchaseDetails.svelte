<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
	import { onMount } from "svelte";
	import { Styles, Form, FormGroup, Input, Button, Label, Table, Icon } from "sveltestrap";
    import axios from "axios";

    export let purchase_id;
    let tickets = [];

    onMount (event => {
		//event.preventDefault();
		axios.defaults.withCredentials = true;
		axios.post("/api/getPurchaseDetails", {
            purchase_id: purchase_id
        }).then(res => {
			//console.log(res.data);
            if (res.data.success === true) {
                tickets =  [...res.data.tickets];
                console.log(tickets);
            } else {
                alert("Server error");
            }
		}).catch(function (err) {
			console.log(err);
		});
	});

</script>

<div>
    <Table class='mx-auto' hover style="width: 98%">
        <tbody>
            <tr>
                <th><small>#</small></th>
                <th><small>Ticket ID</small></th>
                <th><small>Passenger Name</small></th>
                <th><small>NID / Passport No. / Birth Certificate No.</small></th>
                <th><small>Seat</small></th>
                <th><small></small></th>
            </tr>
            {#each tickets as t, i(i)} 
                <tr>
                    <td><small>{i+1}</small></td>
                    <td><a 	style="font-size: 0.8rem; font-family:monospace; cursor:pointer"
                            href={"/api/getTicketPDF?tid=" + t.ticket_id} target="_blank" 
                            class='text-success text-decoration-underline'> {t.ticket_id}                   
                    </a></td>
                    <td><small>{t.name}</small></td>
                    <td><small>{t.person_id}</small></td>
                    <td><small>{t.seat}</small></td>
                    <td><a  href={"/api/getTicketPDF?tid=" + t.ticket_id} target="_blank" 
                            style="font-size: 0.8rem; cursor:pointer" class='text-success text-decoration-underline'>
                        Print <Icon name="box-arrow-up-right"/>
                    </a></td>
                </tr>
            {/each}
        </tbody>
    </Table>
</div>

<style>
    @import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";
    
</style>