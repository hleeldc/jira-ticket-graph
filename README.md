jira-ticket-graph
=================

A web app for showing a group of related JIRA tickets as a graph.

Overview of installation procedure
========================================

* Clone and cd to the repository.
* Install nodejs if you have done so.
* Run `npm install`.
* Create `scripts/apiurl.txt` file. See below for details.
* Create `scripts/auth.txt` file. See below for details.
* Run `scripts/download.sh`. This downloads files to the /tmp/ directory.
* Copy or move /tmp/file-*.txt files to the `issue_db` directory.
* Run `node server.js`.
* Open `http://localhost:3001` in your browser.
 

Creating scripts/apiurl.txt file
================================

This file contains a single line containing the URL of the JIRA REST API.
For example,

    https://ldc-issues.jira.com/rest/api/2
    

Creating scripts/auth.txt file
==============================

This file contains JIRA username and password encoded in base64. The username
and password should be combined with a colon. For example,

```ruby
require base64
Base64.encode64("johndoe:secret").strip
```

```javascript    
// using a browser javascript console
btoa("johndoe:secret")
```

In the above examples, you should get `am9obmRvZTpzZWNyZXQ=`.

    
