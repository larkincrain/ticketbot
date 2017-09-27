# ticketbot
slackbot that helps teams interact with their tickets.

# features

// Merge Requests
- Create a new merge request \r\n
  "tickbot merge {{source_branch}} into {{target_branch}} {{title}}"

// Edit tickets
- Change the status of a tickets \r\n
  "ticketbot update ticket #{{ticket_number}} to {{status}}"

- Change the milestone of a ticket \r\n
  "ticketbot assign ticket #{{ticket_number}} to {{milestone}}"

// Queries
- See which users have open (New, InProgress, Ready) tickets in a milestone: \r\n
  "ticketbot who has open tickets in milestone {{milestone}}"

- See how many open (New, InProgress, Ready) tickets are in all milestones: \r\n
  "ticketbot how many tickets are open in all milestones"

- See which milestones are open: \r\n
  "ticketbot milestones"

- See which users are active: \r\n
  "ticketbot users"

// Fun
- Say I love you! \r\n
  "ticketbot I love you"

- Say thanks! \r\n
  "ticketbot thanks"
