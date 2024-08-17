<script>

    import { Button, Icon, List, ListItem, NavigationDrawer } from "svelte-materialify";
    import sitelogo from "../assets/genericlogo.png";
    import { mdiAccount, mdiAccountGroup, mdiAccountPlus, mdiContacts, mdiFile, mdiViewDashboard } from "@mdi/js";
    export let userContacts=[], currentUser="", onLogout = () => {};
</script>

<NavigationDrawer absolute class="pa-5 blue lighten-2" style="position:fixed; z-index:100">
    <img src={sitelogo} class="mb-3 mt-2 align-self-center" alt="logo" style="width:100%"/>
    <List>
      <ListItem on:click={()=> {
            window.location.href = "/dashboard";
        }}>
        <span slot="prepend">
          <Icon path={mdiViewDashboard} />
        </span>
        Upload file
      </ListItem>
      <ListItem on:click={()=> {
        window.location.href = "/admin-dashboard";
            }}>
            <span slot="prepend">
            <Icon path={mdiFile} />
            </span>
            User files
        </ListItem>
        <ListItem on:click={()=> {
            window.location.href = "/user-list";
                }}>
                <span slot="prepend">
                <Icon path={mdiAccountGroup} />
                </span>
                User List
        </ListItem>
        <ListItem on:click={()=> {
            window.location.href = "/add-contact";
                }}>
            <span slot="prepend">
                <Icon path={mdiAccountPlus} />
            </span>
            Add Contact
        </ListItem>	
        <ListItem>
            <span slot="prepend">
                <Icon path={mdiContacts} />
            </span>
            <b>Contacts:</b>
        </ListItem>	
        {#each userContacts as c} 
            <ListItem on:click={()=> {
                window.location.href = "/messages?contact=" + c.cid;
            }}>
                <span slot="prepend">
                    <Icon path={mdiAccount} />
                </span>
                <small ><a style="color:darkblue" href={"/messages?contact=" + c.cid}>
                    {c.cname + (Number(c.sdiff)<0 ? "  📩":"")}</a>
                </small>
            </ListItem>	
        {/each}
    </List>
    <div style="flex-grow:1" />
    <span slot="append" class="pa-2">
          {#if currentUser !== null} <Button block on:click={onLogout}
        class="a-4 mt-3 blue darken-3 grey-text text-lighten-5 rounded-xl align-self-center">Logout</Button> {/if}
    </span>
</NavigationDrawer>