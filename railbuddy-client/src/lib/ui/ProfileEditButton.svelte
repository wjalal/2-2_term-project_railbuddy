<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
	import { onMount } from "svelte";
	import { Styles, Form, FormGroup, Input, Button, Label, Table, Icon } from "sveltestrap";
    
    export let attr;
    export let showUpdateInput;
</script>

<Button color="light" on:click={(event)=> showUpdateInput(event, attr)} >
    <Icon name="pencil-square"/>
</Button>