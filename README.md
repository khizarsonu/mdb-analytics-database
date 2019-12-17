<!--
-->


<!-- 


[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url] -->



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="http://205.147.101.66/parth/mdb">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">MDB</h3>

  <p align="center">
    MDB is a column-oriented, real-time analytics data store. That is commonly used to store a huge number of transactions in time. It also provides very good Data ingestion. MDB excels as a data warehousing solution for fast aggregate queries on petabyte sized data sets.
    <br />
    <a href="https://github.com/github_username/repo"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/github_username/repo">View Demo</a>
    ·
    <a href="http://205.147.101.66/parth/mdb/issues">Report Bug</a>
    ·
    <a href="https://github.com/github_username/repo/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)
* [Acknowledgments](#acknowledgements)



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

There are many column-based grate database projects available online that handles this kind of features. after trying some of them we can say some have missing features we need, some have really difficult documentation, some have an awesome combo of every feature but it is too much heavy for us. MDB is the exact our need. 

#### -> Your time should be focused on creating something amazing rather than reading documentation and integrating, MDB will give you this freedome
#### -> One can easily integrate MDB, you just need to hit an endpoint that it.
#### -> For now it supports MongoDB as backend storage. because scaling and replication are very straight in MongoDB.

Of course, no one Database will serve all projects since your needs may be different. So We'll be adding more shortly. You may also suggest changes by forking this repo and creating a pull request or opening an issue.

### Built With

* []() Node-JS
* []() Docker

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* npm

This will install all the node packages used in this project.
```sh
npm install
```
* MongoDB

This will main storage that store raw data and analytics.

docker file in mongo_infra


### Installation
 
1. Clone the repo
```sh
git clone https:://github.com/github_username/repo.git
```
2. Install NPM packages
```sh
npm install
```

### Run


1. Run MDB 
```sh
npm start
```

2. Run Aggregator
```sh
node main_aggregator/app.js
```
3. Run Scheduled Aggregator
```sh
node mAggregator/app.js
```

<!-- USAGE EXAMPLES -->
## Usage

**Title**
#### 1. Create a data source and schema.
```
curl -X POST \
  http://localhost:6262/create-data-source/{dataSource} \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
	"dimensions": {
		"account_id": "parseInt",
		"user_id": "String",
		"offer_id": "String",
		"campaign_id": "String",
		"eventid": "String",
		"track1": "String",
		"country": "String",
		"os": "String",
		"browser": "String",
		"scrub": "String",
		"adv_price": "String",
		"pub_price": "String"
	},
	"metrics": {
		"click": "parseInt",
		"price": "parseFloat"
	},
	"granularity": {
		"format": "hourly"
	},
	"timestamp": {
		"date": "datetime"	
	}
}'
```

#### 2. Edit schema of existing data source.

```
curl -X POST \
  http://localhost:6262/edit-data-source/{dataSource} \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
	"dimensions": {
		"account_id": "parseInt",
		"user_id": "String",
		"offer_id": "String",
		"campaign_id": "String",
		"eventid": "String",
		"track1": "String",
		"country": "String",
		"os": "String",
		"browser": "String",
		"scrub": "String",
		"adv_price": "String",
		"pub_price": "String"
	},
	"metrics": {
		"click": "parseInt",
		"price": "parseFloat"
	},
	"granularity": {
		"format": "hourly"
	},
	"timestamp": {
		"date": "datetime"
	}
}'
```
#### 3. Insert data in datasource.
```
curl -X POST \
  http://localhost:6262/insert-data-source/{dataSource} \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
    "dimensions": {
        "account_id": "2",
        "user_id": "5",
        "offer_id": "5",
        "campaign_id": "abc",
        "eventid": "ad",
        "track1": "5",
        "country": "ind",
        "os": "asd",
        "browser": "b",
        "scrub": "b",
        "adv_price": "54",
        "pub_price": "4"
    },
    "metrics": {
        "click": "1",
        "price": "1.0"
    },
    "timestamp": {
        "date":"2017-06-29T12:02:00Z"
    }
}'
```
#### 4. Get aggregated data
```
curl -X POST \
  http://localhost:6363/get-aggregator-all/{dataSource} \
  -H 'cache-control: no-cache'
```
#### 5. Get realtime aggregated data
```
curl -X POST \
  http://localhost:6363/get-aggregator-realtime/{dataSource} \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache'
```

#### 6. Get aggregation of data between given date and selected dimensions  
```
curl -X POST \
  http://localhost:6363/get-aggregator-all/{dataSource} \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "dimensions": {
        "eventid": [
            "ad2"
        ]
    },
    "date": {
        "start": "2017-04-01T00:00:00.000Z",
        "end": "2017-07-01T00:00:00.000Z"
    }
}'
```


#### 7. Get aggregation of aggregated data 
```
curl -X POST \
  http://localhost:6363/get-aggregator/{dataSource} \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "dimensions": {
        "account_id": [
            "4",
            "2"
        ]
    },
    "projection": [
        "user_id",
        "track1"
    ],
    "metrics": [
        "click",
        "price"
    ]
}'
```
#### 8. Get aggregation of aggregated data between start and end date 
```
curl -X POST \
  http://localhost:6363/get-aggregator/{dataSource} \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "dimensions": {
        "account_id": [
            "4",
            "2"
        ]
    },
    "date": {
        "start": "2017-06-04T06:34:00Z",
        "end": "2017-06-08T06:34:00Z"
    },
    "projection": [
        "user_id",
        "track1"
    ],
    "metrics": [
        "click",
        "price"
    ]
}'
```
#### 8. Get aggregation of aggregated data between start and end date with given granularity
curl -X POST \
  http://localhost:6363/get-aggregator/test \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "dimensions": {
        "account_id": [
            "4",
            "2"
        ]
    },
    "date": {
        "start": "2017-06-15T05:12:00.000Z",
        "end": "2017-06-17T06:34:00.000Z"
    },
    "projection": [
        "user_id",
        "track1"
    ],
    "granularity": {
        "format": "monthly"
    },
    "metrics": [
        "click",
        "price"
    ]
}'


<!-- ROADMAP -->
## Roadmap

See the [open issues](http://205.147.101.66/parth/mdb/issues/new) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what Contributions are what makes the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.
Fork the Project
Create your Feature Branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the Branch (git push origin feature/AmazingFeature)
Open a Pull Request
 the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Your Name - [@twitter_handle](https://twitter.com/twitter_handle) - email

Project Link: [https://github.com/khizarsonu/mdb-analytics-database](https://github.com/khizarsonu/mdb-analytics-database)



<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

* []()
* []()
* []()





<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
<!-- [contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=flat-square
[contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=flat-square
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=flat-square
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=flat-square
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=flat-square
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/\
[product-screenshot]: images/screenshot.png -->
