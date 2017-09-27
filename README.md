# ticketbot
slackbot that helps teams interact with their tickets.

## features

### Merge Requests
- Create a new merge request:
```
  "ticketbot merge {{source_branch}} into {{target_branch}} {{title}}"
```

### Edit tickets
- Change the status of a tickets:
```
  "ticketbot update ticket #{{ticket_number}} to {{status}}"
```

- Change the milestone of a ticket:
```
  "ticketbot assign ticket #{{ticket_number}} to {{milestone}}"
```

### Queries
- See which users have open (New, InProgress, Ready) tickets in a milestone:
```
  "ticketbot who has open tickets in milestone {{milestone}}"
```

- See how many open (New, InProgress, Ready) tickets are in all milestones:
```
  "ticketbot how many tickets are open in all milestones"
```

- See which milestones are open:
```
  "ticketbot milestones"
```

- See which users are active:
```
  "ticketbot users"
```

### Fun
- Say I love you!
```
  "ticketbot I love you"
```

- Say thanks!
```
  "ticketbot thanks"
```
