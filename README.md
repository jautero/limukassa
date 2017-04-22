The account database for Limumaatti
===================================

Accounts
--------

Accounts are used for balance

Fields
- email
- uid
- debit
- credit

Users
-----

Users are used for authentication

Fields
- type
- username
- hash
- apikey

API
---

API has following following commands:
- GET, POST account
- GET, POST user
- GET balance
- POST debit
- POST credit
- POST login