<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
	import { onMount } from "svelte";
	import { Styles, Form, FormGroup, Input, Button, Label, Table, Icon } from "sveltestrap";
    import axios from "axios";

    export let mode = "none";
    let currentUser, backLink = "/search", purchaseHref = 'purchases';
    import { userName } from "../userStore.js";
    userName.subscribe(value => {
		currentUser = value;
	});

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('class') != null && urlParams.get('from') != null && urlParams.get('to') != null && urlParams.get('date') != null) {
        console.log(urlParams.get('class'));
        backLink += "?from=" + (urlParams.get('from'));
        backLink += "&to=" + (urlParams.get('to'));
        backLink += "&date=" + (urlParams.get('date'));
        backLink += "&class=" + (urlParams.get('class'));
        purchaseHref += "?pid=" + urlParams.get('pid');
    };
</script>

<div class='d-flex flex-column m-5 p-5 justify-content-start'>
    {#if mode === "none" || currentUser === null} 
        <p class='h2 text-success'><Icon name='question-diamond-fill'/> Nothing Here!</p><br>
    {:else}
        <p class='h2 text-{mode === "success"? "success":"danger"}'>
            <Icon name='patch-{mode === "success"? "check":"exclamation"}-fill'/> 
            Payment {mode === "success"? "Successful" :
                                                        mode === "cancel"? "Cancelled" : "Failed"}</p><br>
        <p>Your order {mode === "success"? "should be confirmed in a short while." :
                                mode === "cancel"? "was suspended because of cancellation of payment from your side." :
                                         "was rejected because your payment has failed."}</p><br>                    
        <a href={backLink}><Icon name='arrow-return-left'/> &nbsp; Back to Search</a><br>                                
        <a href='/'><Icon name='house-fill'/> &nbsp; Return to Home</a><br>
        <a href={purchaseHref}><Icon name='clock-history'/> &nbsp; View my Purchase History / Print Tickets</a>
    {/if}
</div>
