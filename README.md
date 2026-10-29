# Used car prices prediction under shock variables

### Introduction
This work explores the impact to prediction models from macro economic and policy change shocl variables. we aim to explore the performance of existing models and implement a model that takes said variables into account and make adjust to such shock variables.
### Process
#### Data
We searched for data sets and read the existing reasearch. which does not include a clear dataset that satisfies our data requriments. we requrie a data of vehicles sold between the year 2019-present date. For that we have decided to parse web page archiving site [waybackMachine](web.archive.org).

For that we interfaced with [CDX](https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://archive.org/help/wayback_api.php&ved=2ahUKEwiw3O6e89qXAxXOyTgGHUkRHvAQFnoECA8QAQ&usg=AOvVaw2Q8XdAQddzJrOPO0XwOrTa); the API used to browse the collected data. CDX provoed a link file with the available time series
